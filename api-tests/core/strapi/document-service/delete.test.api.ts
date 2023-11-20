import { LoadedStrapi } from '@strapi/types';
import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';
import { testInTransaction } from '../../../utils/index';
import resources from './resources/index';
import { ARTICLE_UID, findArticleDb, findArticlesDb } from './utils';

describe('Document Service', () => {
  let testUtils;
  let strapi: LoadedStrapi;

  beforeAll(async () => {
    testUtils = await createTestSetup(resources);
    strapi = testUtils.strapi;
  });

  afterAll(async () => {
    await destroyTestSetup(testUtils);
  });

  describe('Delete', () => {
    it(
      'delete an entire document',
      testInTransaction(async () => {
        const articleDb = await findArticleDb({ title: 'Article1-Draft-EN' });
        await strapi.documents(ARTICLE_UID).delete(articleDb.documentId);

        const articles = await findArticlesDb({ documentId: articleDb.documentId });

        expect(articles).toHaveLength(0);
      })
    );

    it(
      'delete a document locale',
      testInTransaction(async () => {
        const articleDb = await findArticleDb({ title: 'Article1-Draft-FR' });
        await strapi.documents(ARTICLE_UID).delete(articleDb.documentId, {
          locale: 'fr',
        });

        const articles = await findArticlesDb({ documentId: articleDb.documentId });

        expect(articles.length).toBeGreaterThan(0);
        // Should not have french locale
        articles.forEach((article) => {
          expect(article.locale).not.toBe('fr');
        });
      })
    );

    it(
      'cannot delete a draft directly',
      testInTransaction(async () => {
        const articleDb = await findArticleDb({ title: 'Article2-Draft-EN' });
        const articlePromise = strapi.documents(ARTICLE_UID).delete(articleDb.documentId, {
          status: 'draft',
        });

        await expect(articlePromise).rejects.toThrow('Cannot delete a draft document');
      })
    );

    it(
      'deleting a published version keeps the draft version',
      testInTransaction(async () => {
        const articleDb = await findArticleDb({ title: 'Article2-Draft-EN' });
        await strapi.documents(ARTICLE_UID).delete(articleDb.documentId, {
          status: 'published',
        });

        const articles = await findArticlesDb({ documentId: articleDb.documentId });

        expect(articles.length).toBe(1);
        expect(articles[0].publishedAt).toBeNull();
      })
    );
  });
});
