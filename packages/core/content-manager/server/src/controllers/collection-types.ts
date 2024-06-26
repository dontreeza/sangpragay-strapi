import { setCreatorFields, async, errors, contentTypes } from '@strapi/utils';

import type { Modules, UID } from '@strapi/types';

import { getService } from '../utils';
import { validateBulkActionInput } from './validation';
import { getProhibitedCloningFields, excludeNotCreatableFields } from './utils/clone';
import { getDocumentLocaleAndStatus } from './validation/dimensions';
import { formatDocumentWithMetadata } from './utils/metadata';

type Options = Modules.Documents.Params.Pick<UID.ContentType, 'populate:object'>;

/**
 * Create a new document.
 *
 * @param ctx - Koa context
 * @param opts - Options
 * @param opts.populate - Populate options of the returned document.
 *                        By default documentManager will populate all relations.
 */
const createDocument = async (ctx: any, opts?: Options) => {
  const { userAbility, user } = ctx.state;
  const { model } = ctx.params;
  const { body } = ctx.request;

  const documentManager = getService('document-manager');
  const permissionChecker = getService('permission-checker').create({ userAbility, model });

  if (permissionChecker.cannot.create()) {
    throw new errors.ForbiddenError();
  }

  const pickPermittedFields = permissionChecker.sanitizeCreateInput;
  const setCreator = setCreatorFields({ user });
  const sanitizeFn = async.pipe(pickPermittedFields, setCreator as any);
  const sanitizedBody = await sanitizeFn(body);

  const {
    locale,
    status = contentTypes.hasDraftAndPublish(strapi.getModel(model)) ? 'draft' : 'published',
  } = await getDocumentLocaleAndStatus(body);

  return documentManager.create(model, {
    data: sanitizedBody as any,
    locale,
    status,
    populate: opts?.populate,
  });

  // TODO: Revert the creation if create permission conditions are not met
  // if (permissionChecker.cannot.create(document)) {
  //   throw new errors.ForbiddenError();
  // }
};

/**
 * Update a document version.
 * - If the document version exists, it will be updated.
 * - If the document version does not exist, a new document locale will be created.
 *   By default documentManager will populate all relations.
 *
 * @param ctx - Koa context
 * @param opts - Options
 * @param opts.populate - Populate options of the returned document
 */
const updateDocument = async (ctx: any, opts?: Options) => {
  const { userAbility, user } = ctx.state;
  const { id, model } = ctx.params;
  const { body } = ctx.request;

  const documentManager = getService('document-manager');
  const permissionChecker = getService('permission-checker').create({ userAbility, model });

  if (permissionChecker.cannot.update()) {
    throw new errors.ForbiddenError();
  }

  // Populate necessary fields to check permissions
  const permissionQuery = await permissionChecker.sanitizedQuery.update(ctx.query);
  const populate = await getService('populate-builder')(model)
    .populateFromQuery(permissionQuery)
    .build();

  const { locale } = await getDocumentLocaleAndStatus(body);

  // Load document version to update
  const [documentVersion, documentExists] = await Promise.all([
    documentManager.findOne(id, model, { populate, locale, status: 'draft' }),
    documentManager.exists(model, id),
  ]);

  if (!documentExists) {
    throw new errors.NotFoundError();
  }

  // If version is not found, but document exists,
  // the intent is to create a new document locale
  if (documentVersion) {
    if (permissionChecker.cannot.update(documentVersion)) {
      throw new errors.ForbiddenError();
    }
  } else if (permissionChecker.cannot.create()) {
    throw new errors.ForbiddenError();
  }

  const pickPermittedFields = documentVersion
    ? permissionChecker.sanitizeUpdateInput(documentVersion)
    : permissionChecker.sanitizeCreateInput;
  const setCreator = setCreatorFields({ user, isEdition: true });
  const sanitizeFn = async.pipe(pickPermittedFields, setCreator as any);
  const sanitizedBody = await sanitizeFn(body);

  return documentManager.update(documentVersion?.documentId || id, model, {
    data: sanitizedBody as any,
    populate: opts?.populate,
    locale,
  });
};

export default {
  async find(ctx: any) {
    const { userAbility } = ctx.state;
    const { model } = ctx.params;
    const { query } = ctx.request;

    const documentMetadata = getService('document-metadata');
    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.read(query);

    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .populateDeep(1)
      .countRelations({ toOne: false, toMany: true })
      .build();

    const { locale, status } = await getDocumentLocaleAndStatus(query);

    const { results: documents, pagination } = await documentManager.findPage(
      { ...permissionQuery, populate, locale, status },
      model
    );

    // TODO: Skip this part if not necessary (if D&P disabled or columns not displayed in the view)
    const documentsAvailableStatus = await documentMetadata.getManyAvailableStatus(
      model,
      documents
    );

    const setStatus = (document: any) => {
      // Available status of document
      const availableStatuses = documentsAvailableStatus.filter(
        (d: any) => d.documentId === document.documentId
      );
      // Compute document version status
      document.status = documentMetadata.getStatus(document, availableStatuses);
      return document;
    };

    const results = await async.map(
      documents,
      async.pipe(permissionChecker.sanitizeOutput, setStatus)
    );

    ctx.body = {
      results,
      pagination,
    };
  },

  async findOne(ctx: any) {
    const { userAbility } = ctx.state;
    const { model, id } = ctx.params;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.read(ctx.query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .populateDeep(Infinity)
      .countRelations()
      .build();

    const { locale, status = 'draft' } = await getDocumentLocaleAndStatus(ctx.query);

    const version = await documentManager.findOne(id, model, {
      populate,
      locale,
      status,
    });

    if (!version) {
      // Check if document exists
      const exists = await documentManager.exists(model, id);
      if (!exists) {
        return ctx.notFound();
      }

      // If the requested locale doesn't exist, return an empty response
      const { meta } = await formatDocumentWithMetadata(
        permissionChecker,
        model,
        // @ts-expect-error TODO: fix
        { id, locale, publishedAt: null },
        { availableLocales: true, availableStatus: false }
      );

      ctx.body = { data: {}, meta };

      return;
    }

    // if the user has condition that needs populated content, it's not applied because entity don't have relations populated
    if (permissionChecker.cannot.read(version)) {
      return ctx.forbidden();
    }

    // TODO: Count populated relations by permissions
    const sanitizedDocument = await permissionChecker.sanitizeOutput(version);
    ctx.body = await formatDocumentWithMetadata(permissionChecker, model, sanitizedDocument);
  },

  async create(ctx: any) {
    const { userAbility } = ctx.state;
    const { model } = ctx.params;

    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    const [totalEntries, document] = await Promise.all([
      strapi.db.query(model).count(),
      createDocument(ctx),
    ]);

    const sanitizedDocument = await permissionChecker.sanitizeOutput(document);
    ctx.status = 201;
    ctx.body = await formatDocumentWithMetadata(permissionChecker, model, sanitizedDocument, {
      // Empty metadata as it's not relevant for a new document
      availableLocales: false,
      availableStatus: false,
    });

    if (totalEntries === 0) {
      strapi.telemetry.send('didCreateFirstContentTypeEntry', {
        eventProperties: { model },
      });
    }
  },

  async update(ctx: any) {
    const { userAbility } = ctx.state;
    const { model } = ctx.params;

    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    const updatedVersion = await updateDocument(ctx);

    const sanitizedVersion = await permissionChecker.sanitizeOutput(updatedVersion);
    ctx.body = await formatDocumentWithMetadata(permissionChecker, model, sanitizedVersion);
  },

  async clone(ctx: any) {
    const { userAbility, user } = ctx.state;
    const { model, sourceId: id } = ctx.params;
    const { body } = ctx.request;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.create()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.create(ctx.query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .build();

    const { locale } = await getDocumentLocaleAndStatus(body);
    const document = await documentManager.findOne(id, model, {
      populate,
      locale,
      status: 'draft',
    });

    if (!document) {
      return ctx.notFound();
    }

    const pickPermittedFields = permissionChecker.sanitizeCreateInput;
    const setCreator = setCreatorFields({ user });
    const excludeNotCreatable = excludeNotCreatableFields(model, permissionChecker);
    const sanitizeFn = async.pipe(pickPermittedFields, setCreator as any, excludeNotCreatable);
    const sanitizedBody = await sanitizeFn(body);

    const clonedDocument = await documentManager.clone(document.documentId, sanitizedBody, model);

    const sanitizedDocument = await permissionChecker.sanitizeOutput(clonedDocument);
    ctx.body = await formatDocumentWithMetadata(permissionChecker, model, sanitizedDocument, {
      // Empty metadata as it's not relevant for a new document
      availableLocales: false,
      availableStatus: false,
    });
  },

  async autoClone(ctx: any) {
    const { model } = ctx.params;

    // Check if the model has fields that prevent auto cloning
    const prohibitedFields = getProhibitedCloningFields(model);

    if (prohibitedFields.length > 0) {
      return ctx.badRequest(
        'Entity could not be cloned as it has unique and/or relational fields. ' +
          'Please edit those fields manually and save to complete the cloning.',
        {
          prohibitedFields,
        }
      );
    }

    await this.clone(ctx);
  },

  async delete(ctx: any) {
    const { userAbility } = ctx.state;
    const { id, model } = ctx.params;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.delete()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.delete(ctx.query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .build();

    const { locale } = await getDocumentLocaleAndStatus(ctx.query);

    // Find locales to delete
    const documentLocales = await documentManager.findLocales(id, model, { populate, locale });

    if (documentLocales.length === 0) {
      return ctx.notFound();
    }

    for (const document of documentLocales) {
      if (permissionChecker.cannot.delete(document)) {
        return ctx.forbidden();
      }
    }

    const result = await documentManager.delete(id, model, { locale });

    ctx.body = await permissionChecker.sanitizeOutput(result);
  },

  /**
   * Publish a document version.
   * Supports creating/saving a document and publishing it in one request.
   */
  async publish(ctx: any) {
    const { userAbility } = ctx.state;
    // If id does not exist, the document has to be created
    const { id, model } = ctx.params;
    const { body } = ctx.request;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.publish()) {
      return ctx.forbidden();
    }

    const publishedDocument = await strapi.db.transaction(async () => {
      // Create or update document
      const permissionQuery = await permissionChecker.sanitizedQuery.publish(ctx.query);
      const populate = await getService('populate-builder')(model)
        .populateFromQuery(permissionQuery)
        .populateDeep(Infinity)
        .countRelations()
        .build();

      const document = id
        ? await updateDocument(ctx, { populate })
        : await createDocument(ctx, { populate });

      if (permissionChecker.cannot.publish(document)) {
        throw new errors.ForbiddenError();
      }

      const { locale } = await getDocumentLocaleAndStatus(body);

      const publishResult = await documentManager.publish(document!.documentId, model, {
        locale,
        // TODO: Allow setting creator fields on publish
        // data: setCreatorFields({ user, isEdition: true })({}),
      });

      if (!publishResult || publishResult.length === 0) {
        throw new errors.NotFoundError('Document not found or already published.');
      }

      return publishResult[0];
    });

    const sanitizedDocument = await permissionChecker.sanitizeOutput(publishedDocument);
    ctx.body = await formatDocumentWithMetadata(permissionChecker, model, sanitizedDocument);
  },

  async bulkPublish(ctx: any) {
    const { userAbility } = ctx.state;
    const { model } = ctx.params;
    const { body } = ctx.request;
    const { documentIds } = body;

    await validateBulkActionInput(body);

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.publish()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.publish(ctx.query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .populateDeep(Infinity)
      .countRelations()
      .build();

    const { locale } = await getDocumentLocaleAndStatus(body, { allowMultipleLocales: true });

    const entityPromises = documentIds.map((documentId: any) =>
      documentManager.findLocales(documentId, model, { populate, locale, isPublished: false })
    );
    const entities = (await Promise.all(entityPromises)).flat();

    for (const entity of entities) {
      if (!entity) {
        return ctx.notFound();
      }

      if (permissionChecker.cannot.publish(entity)) {
        return ctx.forbidden();
      }
    }

    const count = await documentManager.publishMany(model, documentIds, locale);
    ctx.body = { count };
  },

  async bulkUnpublish(ctx: any) {
    const { userAbility } = ctx.state;
    const { model } = ctx.params;
    const { body } = ctx.request;
    const { documentIds } = body;

    await validateBulkActionInput(body);

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.unpublish()) {
      return ctx.forbidden();
    }

    const { locale } = await getDocumentLocaleAndStatus(body);

    const entityPromises = documentIds.map((documentId: any) =>
      documentManager.findLocales(documentId, model, { locale, isPublished: true })
    );
    const entities = (await Promise.all(entityPromises)).flat();

    for (const entity of entities) {
      if (!entity) {
        return ctx.notFound();
      }

      if (permissionChecker.cannot.publish(entity)) {
        return ctx.forbidden();
      }
    }

    const entitiesIds = entities.map((document) => document.documentId);

    const { count } = await documentManager.unpublishMany(entitiesIds, model, { locale });

    ctx.body = { count };
  },

  async unpublish(ctx: any) {
    const { userAbility } = ctx.state;
    const { id, model } = ctx.params;
    const {
      body: { discardDraft, ...body },
    } = ctx.request;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.unpublish()) {
      return ctx.forbidden();
    }

    if (discardDraft && permissionChecker.cannot.discard()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.unpublish(ctx.query);

    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .build();

    // TODO allow multiple locales for bulk locale unpublish
    const { locale } = await getDocumentLocaleAndStatus(body);
    const document = await documentManager.findOne(id, model, {
      populate,
      locale,
      status: 'published',
    });

    if (!document) {
      throw new errors.NotFoundError();
    }

    if (permissionChecker.cannot.unpublish(document)) {
      throw new errors.ForbiddenError();
    }

    if (discardDraft && permissionChecker.cannot.discard(document)) {
      throw new errors.ForbiddenError();
    }

    await strapi.db.transaction(async () => {
      if (discardDraft) {
        await documentManager.discardDraft(document.documentId, model, { locale });
      }

      ctx.body = await async.pipe(
        (document) => documentManager.unpublish(document.documentId, model, { locale }),
        permissionChecker.sanitizeOutput,
        (document) => formatDocumentWithMetadata(permissionChecker, model, document)
      )(document);
    });
  },

  async discard(ctx: any) {
    const { userAbility } = ctx.state;
    const { id, model } = ctx.params;
    const { body } = ctx.request;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.discard()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.discard(ctx.query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .build();

    const { locale } = await getDocumentLocaleAndStatus(body);
    const document = await documentManager.findOne(id, model, {
      populate,
      locale,
      status: 'published',
    });

    // Can not discard a document that is not published
    if (!document) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.discard(document)) {
      return ctx.forbidden();
    }

    ctx.body = await async.pipe(
      (document) => documentManager.discardDraft(document.documentId, model, { locale }),
      permissionChecker.sanitizeOutput,
      (document) => formatDocumentWithMetadata(permissionChecker, model, document)
    )(document);
  },

  async bulkDelete(ctx: any) {
    const { userAbility } = ctx.state;
    const { model } = ctx.params;
    const { query, body } = ctx.request;
    const { documentIds } = body;

    await validateBulkActionInput(body);

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.delete()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.delete(query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .build();

    const { locale } = await getDocumentLocaleAndStatus(body);

    const documentLocales = await documentManager.findLocales(documentIds, model, {
      populate,
      locale,
    });

    if (documentLocales.length === 0) {
      return ctx.notFound();
    }

    for (const document of documentLocales) {
      if (permissionChecker.cannot.delete(document)) {
        return ctx.forbidden();
      }
    }

    // We filter out documentsIds that maybe doesn't exist in a specific locale
    const localeDocumentsIds = documentLocales.map((document) => document.documentId);

    const { count } = await documentManager.deleteMany(localeDocumentsIds, model, { locale });

    ctx.body = { count };
  },

  async countDraftRelations(ctx: any) {
    const { userAbility } = ctx.state;
    const { model, id } = ctx.params;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const permissionQuery = await permissionChecker.sanitizedQuery.read(ctx.query);
    const populate = await getService('populate-builder')(model)
      .populateFromQuery(permissionQuery)
      .build();

    const {
      locale,
      status = contentTypes.hasDraftAndPublish(strapi.getModel(model)) ? 'draft' : 'published',
    } = await getDocumentLocaleAndStatus(ctx.query);
    const entity = await documentManager.findOne(id, model, { populate, locale, status });

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.read(entity)) {
      return ctx.forbidden();
    }

    const number = await documentManager.countDraftRelations(id, model, locale);

    return {
      data: number,
    };
  },

  async countManyEntriesDraftRelations(ctx: any) {
    const { userAbility } = ctx.state;
    const ids = ctx.request.query.documentIds as string[];
    const locale = ctx.request.query.locale as string[];
    const { model } = ctx.params;

    const documentManager = getService('document-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const documents = await documentManager.findMany(
      {
        filters: {
          documentId: ids,
        },
        locale,
      },
      model
    );

    if (!documents) {
      return ctx.notFound();
    }

    const number = await documentManager.countManyEntriesDraftRelations(ids, model, locale);

    return {
      data: number,
    };
  },
};
