import { LoadedStrapi } from '@strapi/types';
import './resources/types/components.d.ts';
import './resources/types/contentTypes.d.ts';
import resources from './resources/index';
import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';

const ARTICLE_UID = 'api::article.article';

const findArticleDb = async (where: any) => {
  return await strapi.query(ARTICLE_UID).findOne({ where });
};

const findArticlesDb = async (where: any) => {
  return await strapi.query(ARTICLE_UID).findMany({ where });
};

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

  describe('Middlewares', () => {
    it('Add filters', async () => {
      strapi.documents.use('findMany', (ctx, next) => {
        // @ts-expect-error - this is using a generic ContentType.UID , so article attributes are not typed
        ctx.params.filters = { title: 'Article1-Draft-EN' };
        return next(ctx);
      });

      const articles = await strapi.documents('api::article.article').findMany({});
      expect(articles).toHaveLength(1);
    });
  });

  describe('Middleware on uid', () => {
    it('Add filters on uid', async () => {
      strapi.documents(ARTICLE_UID).use('findMany', (ctx, next) => {
        ctx.params.filters = { title: 'Article1-Draft-EN' };
        return next(ctx);
      });

      const articles = await strapi.documents(ARTICLE_UID).findMany({});
      expect(articles).toHaveLength(1);
    });
  });

  describe('Middleware priority', () => {
    it('Add middlewares with different priority', async () => {
      const ARTICLE_1 = 'Article1-Draft-EN';
      const ARTICLE_2 = 'Article2-Draft-EN';

      strapi.documents(ARTICLE_UID).use(
        'findMany',
        (ctx, next) => {
          ctx.params.filters = { title: ARTICLE_1 };
          return next(ctx);
        },
        { priority: strapi.documents.middlewares.priority.LAST }
      );

      strapi.documents(ARTICLE_UID).use(
        'findMany',
        (ctx, next) => {
          ctx.params.filters = { title: ARTICLE_2 };
          return next(ctx);
        },
        { priority: strapi.documents.middlewares.priority.FIRST }
      );

      // Higher priority middleware should be called first, even if it's added after
      const articles = await strapi.documents(ARTICLE_UID).findMany({});

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toEqual(ARTICLE_1);
    });
  });
});
