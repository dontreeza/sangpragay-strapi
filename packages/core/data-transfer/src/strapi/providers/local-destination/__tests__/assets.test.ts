import { Writable, Readable } from 'stream';
import fse from 'fs-extra';
import type { IAsset } from '../../../../../types';

import { getStrapiFactory } from '../../../../__tests__/test-utils';
import { createLocalStrapiDestinationProvider } from '../index';

const write = jest.fn((_chunk, _encoding, callback) => {
  callback();
});

const uploadStream = jest.fn(() => null);

const createWriteStreamMock = jest.fn(() => {
  return new Writable({
    objectMode: true,
    write,
  });
});

jest.mock('fs-extra');
const transaction = jest.fn(async (cb) => {
  const trx = {};
  const rollback = jest.fn();
  // eslint-disable-next-line node/no-callback-literal
  await cb({ trx, rollback });
});

const createStrapi = getStrapiFactory({
  dirs: {
    static: {
      public: 'static/public/assets',
    },
  },
  db: {
    transaction,
    query() {
      return {};
    },
  },
  config: {
    get(service: string) {
      if (service === 'plugin::upload') {
        return {
          provider: 'local',
        };
      }
      return {};
    },
  },
  plugin(plugin: string) {
    if (plugin === 'upload') {
      return {
        provider: {
          uploadStream,
        },
      };
    }
  },
});

describe('Local Strapi Destination Provider - Get Assets Stream', () => {
  test('Throws an error if the Strapi instance is not provided', async () => {
    /* @ts-ignore: disable-next-line */
    const provider = createLocalStrapiDestinationProvider({
      strategy: 'restore',
    });

    await expect(() => provider.createAssetsWriteStream()).rejects.toThrowError(
      'Not able to stream Assets. Strapi instance not found'
    );
  });

  test('Returns a stream when assets restore is true', async () => {
    const provider = createLocalStrapiDestinationProvider({
      getStrapi: () => createStrapi(),
      strategy: 'restore',
      restore: {
        assets: true,
      },
    });
    await provider.bootstrap();

    const stream = await provider.createAssetsWriteStream();

    expect(stream instanceof Writable).toBeTruthy();
  });

  test('Throw an error if attempting to create stream while restore assets is false', async () => {
    const provider = createLocalStrapiDestinationProvider({
      getStrapi: () => createStrapi(),
      strategy: 'restore',
      restore: {
        assets: false,
      },
    });
    await provider.bootstrap();

    expect(async () => provider.createAssetsWriteStream()).rejects.toThrow(
      'Attempting to transfer assets when `assets` is not set in restore options'
    );
  });

  test('Writes on the strapi assets path', async () => {
    (fse.createWriteStream as jest.Mock).mockImplementationOnce(createWriteStreamMock);
    const assetsDirectory = 'static/public/assets';
    const file: IAsset = {
      filename: 'test-photo.jpg',
      filepath: 'strapi-import-folder/assets',
      stats: { size: 200 },
      stream: Readable.from(['test', 'test-2']),
      metadata: {
        hash: 'hash',
        name: 'test-photo',
        id: 1,
        url: 'test-photo.jpg',
        size: 200,
        mime: 'test-photo.jpg',
      },
    };
    const provider = createLocalStrapiDestinationProvider({
      getStrapi: () =>
        createStrapi({
          dirs: {
            static: {
              public: assetsDirectory,
            },
          },
          db: {
            transaction,
            query() {
              return {
                findOne() {
                  return {
                    hash: 'hash',
                    name: 'test-photo',
                    id: 1,
                    url: 'test-photo.jpg',
                    size: 200,
                    mime: 'test-photo.jpg',
                  };
                },
                update() {
                  return null;
                },
              };
            },
          },
        }),
      strategy: 'restore',
      restore: {
        assets: true,
      },
    });

    await provider.bootstrap();
    const stream = await provider.createAssetsWriteStream();

    const error = await new Promise<Error | null | undefined>((resolve) => {
      stream.write(file, resolve);
    });

    expect(error).not.toBeInstanceOf(Error);

    expect(uploadStream).toHaveBeenCalled();
  });
});
