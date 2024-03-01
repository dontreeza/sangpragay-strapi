import strapiUtils, { errors } from '@strapi/utils';
import type { Schema } from '@strapi/types';
import validators from '../validators';
import { mockOptions } from './utils';

describe('Date validator', () => {
  const fakeModel: Schema.ContentType = {
    modelType: 'contentType',
    kind: 'collectionType',
    modelName: 'test-model',
    globalId: 'test-model',
    uid: 'api::test.test-uid',
    info: {
      displayName: 'Test model',
      singularName: 'test-model',
      pluralName: 'test-models',
    },
    options: {},
    attributes: {
      attrDateUnique: { type: 'date', unique: true },
    },
  };

  describe('unique', () => {
    const fakeFindFirst = jest.fn();

    global.strapi = {
      db: {
        query: () => ({
          findOne: fakeFindFirst,
        }),
      },
    } as any;

    afterEach(() => {
      jest.clearAllMocks();
      fakeFindFirst.mockReset();
    });

    test('it does not validates the unique constraint if the attribute is not set as unique', async () => {
      fakeFindFirst.mockResolvedValueOnce(null);

      const validator = strapiUtils.validateYupSchema(
        validators.date(
          {
            attr: { type: 'date' },
            model: fakeModel,
            updatedAttribute: { name: 'attrDateUnique', value: '2021-11-29' },
            entity: null,
          },
          mockOptions
        )
      );

      await validator('2021-11-29');

      expect(fakeFindFirst).not.toHaveBeenCalled();
    });

    test('it does not validates the unique constraint if the attribute value is `null`', async () => {
      fakeFindFirst.mockResolvedValueOnce(null);

      const validator = strapiUtils.validateYupSchema(
        validators
          .date(
            {
              attr: { type: 'date', unique: true },
              model: fakeModel,
              updatedAttribute: { name: 'attrDateUnique', value: null },
              entity: null,
            },
            mockOptions
          )
          .nullable()
      );

      await validator(null);
      expect(fakeFindFirst).not.toHaveBeenCalled();
    });

    test('it validates the unique constraint if there is no other record in the database', async () => {
      fakeFindFirst.mockResolvedValueOnce(null);

      const validator = strapiUtils.validateYupSchema(
        validators.date(
          {
            attr: { type: 'date', unique: true },
            model: fakeModel,
            updatedAttribute: { name: 'attrDateUnique', value: '2021-11-29' },
            entity: null,
          },
          mockOptions
        )
      );

      expect(await validator('2021-11-29')).toBe('2021-11-29');
    });

    test('it fails the validation of the unique constraint if the database contains a record with the same attribute value', async () => {
      expect.assertions(1);
      fakeFindFirst.mockResolvedValueOnce({ attrDateUnique: '2021-11-29' });

      const validator = strapiUtils.validateYupSchema(
        validators.date(
          {
            attr: { type: 'date', unique: true },
            model: fakeModel,
            updatedAttribute: { name: 'attrDateUnique', value: '2021-11-29' },
            entity: null,
          },
          mockOptions
        )
      );

      try {
        await validator('2021-11-29');
      } catch (err) {
        expect(err).toBeInstanceOf(errors.YupValidationError);
      }
    });

    test('it validates the unique constraint if the attribute data has not changed even if there is a record in the database with the same attribute value', async () => {
      fakeFindFirst.mockResolvedValueOnce({ attrDateUnique: '2021-11-29' });

      const validator = strapiUtils.validateYupSchema(
        validators.date(
          {
            attr: { type: 'date', unique: true },
            model: fakeModel,
            updatedAttribute: { name: 'attrDateUnique', value: '2021-11-29' },
            entity: { id: 1, attrDateUnique: '2021-11-29' },
          },
          mockOptions
        )
      );

      expect(await validator('2021-11-29')).toBe('2021-11-29');
    });

    test('it checks the database for records with the same value for the checked attribute', async () => {
      fakeFindFirst.mockResolvedValueOnce(null);

      const validator = strapiUtils.validateYupSchema(
        validators.date(
          {
            attr: { type: 'date', unique: true },
            model: fakeModel,
            updatedAttribute: { name: 'attrDateUnique', value: '2021-11-29' },
            entity: null,
          },
          mockOptions
        )
      );

      await validator('2021-11-29');

      expect(fakeFindFirst).toHaveBeenCalledWith({
        where: {
          locale: 'en',
          publishedAt: null,
          attrDateUnique: '2021-11-29',
        },
      });
    });

    test('it checks the database for records with the same value but not the same id for the checked attribute if an entity is passed', async () => {
      fakeFindFirst.mockResolvedValueOnce(null);

      const validator = strapiUtils.validateYupSchema(
        validators.date(
          {
            attr: { type: 'date', unique: true },
            model: fakeModel,
            updatedAttribute: { name: 'attrDateUnique', value: '2021-11-29' },
            entity: { id: 1, attrDateUnique: '2021-12-15' },
          },
          mockOptions
        )
      );

      await validator('2021-11-29');

      expect(fakeFindFirst).toHaveBeenCalledWith({
        where: {
          attrDateUnique: '2021-11-29',
          id: {
            $ne: 1,
          },
          locale: 'en',
          publishedAt: null,
        },
      });
    });
  });
});
