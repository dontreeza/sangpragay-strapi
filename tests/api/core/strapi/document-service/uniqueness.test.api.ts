import type { Core } from '@strapi/types';

import { createTestSetup, destroyTestSetup } from '../../../utils/builder-helper';
import resources from './resources/index';
import { ARTICLE_UID, CATEGORY_UID, Category } from './utils';

describe('Document Service', () => {
  let testUtils;
  let strapi: Core.Strapi;

  let testName;
  let createdCategory;

  beforeAll(async () => {
    testUtils = await createTestSetup(resources);
    strapi = testUtils.strapi;
    testName = testUtils.data.category[0].name;
  });

  afterAll(async () => {
    await destroyTestSetup(testUtils);
  });

  describe('Scalar unique fields', () => {
    it('cannot create a document with a duplicated unique field value in the same publication state', async () => {
      expect(async () => {
        await strapi.documents(CATEGORY_UID).create({
          data: { name: testName },
        });
      }).rejects.toThrow();
    });

    it('cannot update a document to have a duplicated unique field value in the same publication state', async () => {
      const uniqueName = `${testName}-1`;

      const category: Category = await strapi.documents(CATEGORY_UID).create({
        data: { name: uniqueName },
      });
      createdCategory = category;

      expect(async () => {
        await strapi.documents(CATEGORY_UID).update({
          documentId: category.documentId,
          data: { name: testName },
        });
      }).rejects.toThrow();
    });

    it('cannot publish a document to have a duplicated unique field value in the same publication state', async () => {
      const name = `unique-name`;

      const category = await strapi.documents(CATEGORY_UID).create({ data: { name } });

      // Publish that category
      const publishRes = strapi
        .documents(CATEGORY_UID)
        .publish({ documentId: category.documentId });
      await expect(publishRes).resolves.not.toThrowError();

      // Reset the name of the draft category
      await strapi
        .documents(CATEGORY_UID)
        .update({ documentId: category.documentId, data: { name: 'other-not-unique-name' } });

      // Now we can create a new category with the same name as the published category
      // When we try to publish it, it should throw an error
      const newCategory = await strapi.documents(CATEGORY_UID).create({ data: { name } });
      expect(
        strapi.documents(CATEGORY_UID).publish({ documentId: newCategory.documentId })
      ).rejects.toThrow();
    });
  });

  describe('Component unique fields', () => {
    const uniqueTextShort = 'unique-text-short';
    const uniqueTextLong = 'This is a unique long text used for testing purposes.';
    const uniqueNumberInteger = 42;
    const uniqueNumberDecimal = 3.14;
    const uniqueNumberBigInteger = 1234567890123;
    const uniqueNumberFloat = 6.28318;
    const uniqueEmail = 'unique@example.com';
    const uniqueDateDate = '2023-01-01';
    const uniqueDateDateTime = '2023-01-01T00:00:00.000Z';
    const uniqueDateTime = '12:00:00';

    const testValues = {
      ComponentTextShort: uniqueTextShort,
      ComponentTextLong: uniqueTextLong,
      ComponentNumberInteger: uniqueNumberInteger,
      ComponentNumberDecimal: uniqueNumberDecimal,
      ComponentNumberBigInteger: uniqueNumberBigInteger,
      ComponentNumberFloat: uniqueNumberFloat,
      ComponentEmail: uniqueEmail,
      ComponentDateDate: uniqueDateDate,
      ComponentDateDateTime: uniqueDateDateTime,
      ComponentDateTime: uniqueDateTime,
    };

    const otherLocale = 'fr';

    /**
     * Modifies the given value to ensure uniqueness based on the field type.
     * For 'Number' fields, it increments the value by a specified amount.
     * For 'Date' fields, it increments the last number found in the string representation of the date.
     * For other field types, it appends '-different' to the string representation of the value.
     */
    const modifyToDifferentValue = (
      field: string,
      currentValue: string | number,
      options: { increment?: number; suffix?: string } = {
        increment: 1,
        suffix: 'different',
      }
    ) => {
      if (field.includes('Number')) {
        return (currentValue as number) + options.increment;
      } else if (field.includes('Date')) {
        return (currentValue as string).replace(/(\d+)(?=\D*$)/, (match) => {
          const num = parseInt(match, 10) + options.increment;
          return num < 10 ? `0${num}` : num.toString();
        });
      }

      return `${currentValue}-${options.suffix}`;
    };

    for (const [field, value] of Object.entries(testValues)) {
      const testCases = [
        {
          description: 'identifiers',
          createData: (field, value) => ({ identifiers: { nestedUnique: { [field]: value } } }),
        },
        {
          description: 'identifiersDz',
          createData: (field, value) => ({
            identifiersDz: [{ __component: 'article.compo-unique-all', [field]: value }],
          }),
        },
        {
          description: 'repeatableIdentifiers',
          createData: (field, value, repeatTheSameValue = false) => ({
            repeatableIdentifiers: [
              { nestedUnique: { [field]: value } },
              {
                nestedUnique: {
                  [field]: repeatTheSameValue ? value : modifyToDifferentValue(field, value),
                },
              },
            ],
          }),
        },
      ];

      for (const { description, createData } of testCases) {
        it(`cannot create multiple entities with the same unique ${field} value in the same ${description}, locale and publication state`, async () => {
          const isRepeatable = description === 'repeatableIdentifiers';

          if (isRepeatable) {
            await expect(
              strapi.documents(ARTICLE_UID).create({
                data: createData(field, value, true),
              })
            ).rejects.toThrow('2 errors occurred');
          }

          // Create an article in the default locale and publish it
          const article = await strapi.documents(ARTICLE_UID).create({
            data: createData(field, value),
          });
          await strapi.documents(ARTICLE_UID).publish({ documentId: article.documentId });

          // Create and publish an article in a different locale with the same unique value as the first article
          const articleDifferentLocale = await strapi.documents(ARTICLE_UID).create({
            data: createData(field, value),
            locale: otherLocale,
          });
          expect(articleDifferentLocale).toBeDefined();
          await strapi
            .documents(ARTICLE_UID)
            .publish({ documentId: articleDifferentLocale.documentId, locale: otherLocale });

          // Attempt to create another article in the default locale with the same unique value
          // The draft articles should collide and trigger a uniqueness error
          await expect(
            strapi.documents(ARTICLE_UID).create({
              data: isRepeatable
                ? // In testing the repeatable we now want to test that it is
                  // validated against other entities and don't want to trigger a
                  // validation error internal to the current entity.
                  {
                    // @ts-expect-error
                    [description]: [createData(field, value)[description][0]],
                  }
                : createData(field, value),
            })
          ).rejects.toThrow('This attribute must be unique');

          const modificationOptions = isRepeatable
            ? // When creating the first article with a repeatable field, we
              // already applied modifications to the value to ensure
              // uniqueness.
              // Here we want to apply a different modification to the value.
              {
                increment: 10,
                suffix: 'new-suffix',
              }
            : undefined;

          const differentValue = modifyToDifferentValue(field, value, modificationOptions);

          // Create an article in the same locale with a different unique value
          const secondArticle = await strapi.documents(ARTICLE_UID).create({
            data: createData(field, differentValue),
          });
          expect(secondArticle).toBeDefined();
        });
      }
    }
  });
});
