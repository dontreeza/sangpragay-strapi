'use strict';

const { createStrapiInstance } = require('api-tests/strapi');
const { createTestBuilder } = require('api-tests/builder');
const { createAuthRequest } = require('api-tests/request');
const { testInTransaction } = require('../../../utils');

const builder = createTestBuilder();
let strapi;
let formatDocument;

const PRODUCT_UID = 'api::product.product';

const featuresCompo = {
  displayName: 'features',
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'text',
      minLength: 4,
      maxLength: 100,
    },
    slogan: {
      type: 'string',
    },
  },
};

const product = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    // The schema contains different types of fields that require validation
    // This is to ensure that when we request metadata for these documents
    // that the available locales contain data for any fields that require
    // validation. In order to enable error states in bulk action UI modals
    category: {
      type: 'string',
      maxLength: 10,
    },
    price: {
      type: 'integer',
      max: 10,
    },
    features: {
      required: true,
      type: 'component',
      repeatable: false,
      component: 'default.features',
    },
    // TODO - Add other fields with validation requirements
    shopName: {
      // This field has no validation requirements so should be excluded from
      // available locales
      type: 'string',
    },
  },
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  draftAndPublish: true,
  displayName: 'Product',
  singularName: 'product',
  pluralName: 'products',
  description: '',
  collectionName: '',
};

const createProduct = async (id, locale, status, data = {}) => {
  await strapi.db.query(PRODUCT_UID).create({
    data: {
      documentId: id,
      name: `prod-${id}-${locale}-${status}`,
      locale,
      publishedAt: status === 'published' ? '2024-02-16' : null,
      ...data,
    },
  });
};

const getProduct = async (documentId, locale, status) => {
  return strapi.documents(PRODUCT_UID).findOne({ documentId, locale, status });
};

describe('CM API - Document metadata', () => {
  let rq;
  const extraLocaleCode = 'fr';

  beforeAll(async () => {
    await builder.addComponent(featuresCompo).addContentType(product).build();

    strapi = await createStrapiInstance();
    formatDocument = (...props) =>
      strapi
        .plugin('content-manager')
        .service('document-metadata')
        .formatDocumentWithMetadata(...props);

    rq = await createAuthRequest({ strapi });

    await rq({
      method: 'POST',
      url: '/i18n/locales',
      body: {
        code: extraLocaleCode,
        name: `Locale name: (${extraLocaleCode})`,
        isDefault: false,
      },
    });
  });

  afterAll(async () => {
    await strapi.destroy();
    await builder.cleanup();
  });

  testInTransaction('Returns empty metadata when there is only a draft', async () => {
    const documentId = 'product-empty-metadata';
    await createProduct(documentId, 'en', 'draft');

    const product = await getProduct(documentId);
    const { data, meta } = await formatDocument(PRODUCT_UID, product, {});

    expect(data.status).toBe('draft');
    expect(meta.availableLocales).toEqual([]);
    expect(meta.availableStatus).toEqual([]);
  });

  testInTransaction('Returns availableStatus when draft has a published version', async () => {
    const documentId = 'product-available-status';

    await createProduct(documentId, 'en', 'draft');
    await createProduct(documentId, 'en', 'published');

    const draftProduct = await getProduct(documentId, 'en', 'draft');

    const { data, meta } = await formatDocument(PRODUCT_UID, draftProduct, {});

    expect(data.status).toBe('published');
    expect(meta.availableLocales).toEqual([]);
    expect(meta.availableStatus).toMatchObject([
      {
        locale: 'en',
        publishedAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        createdBy: expect.any(Object),
        updatedBy: expect.any(Object),
        // TODO
        // status: 'published',
      },
    ]);
  });

  testInTransaction(
    'Returns availableStatus when published version has a draft version',
    async () => {
      const documentId = 'product-available-status-published';
      await createProduct(documentId, 'en', 'draft');
      await createProduct(documentId, 'en', 'published');

      const draftProduct = await getProduct(documentId, 'en', 'published');

      const { meta } = await formatDocument(PRODUCT_UID, draftProduct, {});

      expect(meta.availableLocales).toEqual([]);
      expect(meta.availableStatus).toMatchObject([
        {
          locale: 'en',
          publishedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.any(Object),
          updatedBy: expect.any(Object),
          // TODO
          // status: 'published',
        },
      ]);
    }
  );

  testInTransaction('Returns available locales when there are multiple locales', async () => {
    const documentId = 'product-available-locales';
    await createProduct(documentId, 'en', 'draft');
    await createProduct(documentId, 'fr', 'draft');

    const draftProduct = await getProduct(documentId, 'en', 'draft');

    const { meta } = await formatDocument(PRODUCT_UID, draftProduct, {});

    expect(meta.availableLocales).toMatchObject([
      {
        locale: 'fr',
        status: 'draft',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
    expect(meta.availableStatus).toEqual([]);
  });

  testInTransaction(
    'Returns modified status when draft is different from published version',
    async () => {
      const documentId = 'product-modified-status';
      // Published versions should have different dates
      await createProduct(documentId, 'en', 'draft');
      await createProduct(documentId, 'en', 'published', { updatedAt: '2024-02-11' });
      await createProduct(documentId, 'fr', 'draft');
      await createProduct(documentId, 'fr', 'published', { updatedAt: '2024-02-11' });

      const draftProduct = await getProduct(documentId, 'en', 'draft');
      const { data, meta } = await formatDocument(PRODUCT_UID, draftProduct, {});

      expect(data.status).toBe('modified');
      expect(meta.availableLocales).toMatchObject([{ locale: 'fr', status: 'modified' }]);
      // expect(meta.availableStatus).toMatchObject([{ status: 'modified' }]);

      const publishedProduct = await getProduct(documentId, 'en', 'published');
      const { data: dataPublished, meta: metaPublished } = await formatDocument(
        PRODUCT_UID,
        publishedProduct,
        {}
      );

      expect(dataPublished.status).toBe('modified');
      expect(metaPublished.availableLocales).toMatchObject([{ locale: 'fr', status: 'modified' }]);
    }
  );

  test('Return available locales, including any fields that require validation', async () => {
    // Create products with different locales with content for every kind of
    // field that requires validation
    const defaultLocaleProduct = await rq({
      method: 'POST',
      url: `/content-manager/collection-types/${PRODUCT_UID}`,
      body: {
        name: `prod-en-draft`,
        category: 'Cat-1-en',
        price: 1,
        features: {
          name: 'Feature 1 en',
          description: 'Description 1',
          slogan: 'Slogan 1',
        },
      },
    });
    const documentId = defaultLocaleProduct.body.data.documentId;

    await rq({
      method: 'PUT',
      url: `/content-manager/collection-types/${PRODUCT_UID}/${documentId}`,
      body: {
        name: `prod-${extraLocaleCode}-draft`,
        category: `Cat-1-${extraLocaleCode}`,
        price: 1,
        features: {
          name: `Feature 1 ${extraLocaleCode}`,
          description: 'Description 1',
          slogan: 'Slogan 1',
        },
      },
      qs: { locale: extraLocaleCode },
    });

    const draftProduct = await getProduct(documentId, 'en', 'draft');
    const { meta } = await formatDocument(PRODUCT_UID, draftProduct, {});

    const expectedLocaleData = {
      documentId: expect.any(String),
      id: expect.any(Number),
      locale: extraLocaleCode,
      name: 'prod-fr-draft',
      category: 'Cat-1-fr',
      price: 1,
      features: {
        id: expect.any(Number),
        name: 'Feature 1 fr',
      },
      status: 'draft',
      publishedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(meta.availableLocales).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedLocaleData)])
    );

    // Ensure no unwanted keys are present
    const unwantedKeys = ['shopName'];
    unwantedKeys.forEach((key) => {
      expect(meta.availableLocales[0]).not.toHaveProperty(key);
    });

    expect(meta.availableStatus).toEqual([]);
  });

  test('Does not return any sensitive information in the available status', async () => {
    const prefix = 'product-sensitive-info-test';
    const defaultLocaleProduct = await rq({
      method: 'POST',
      url: `/content-manager/collection-types/${PRODUCT_UID}`,
      body: {
        name: `${prefix}-en-draft`,
        features: {
          name: `${prefix} Feature 1`,
          description: `${prefix} Description 1`,
          slogan: `${prefix} Slogan 1`,
        },
      },
    });
    const documentId = defaultLocaleProduct.body.data.documentId;

    await rq({
      method: 'POST',
      url: `/content-manager/collection-types/${PRODUCT_UID}/${documentId}/actions/publish`,
      body: {},
    });

    const publishedProduct = await getProduct(documentId, 'en', 'published');
    const { data, meta } = await formatDocument(PRODUCT_UID, publishedProduct, {});

    expect(data.status).toBe('published');

    expect(meta.availableStatus.length).toEqual(1);
    expect(meta.availableStatus[0]).toEqual(
      expect.not.objectContaining({
        createdBy: expect.objectContaining({
          password: expect.anything(),
        }),
        updatedBy: expect.objectContaining({
          password: expect.anything(),
        }),
      })
    );
  });
});
