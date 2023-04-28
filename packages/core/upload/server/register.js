'use strict';

const {
  errors: { PayloadTooLargeError },
  file: { kbytesToBytes, bytesToHumanReadable },
} = require('@strapi/utils');
const _ = require('lodash');
const registerUploadMiddleware = require('./middlewares/upload');
const { getService } = require('./utils');
const spec = require('../documentation/content-api.json');

/**
 * Register upload plugin
 * @param {{ strapi: import('@strapi/strapi').Strapi }}
 */
module.exports = async ({ strapi }) => {
  strapi.plugin('upload').provider = await createProvider(strapi.config.get('plugin.upload', {}));

  await registerUploadMiddleware({ strapi });

  getService('extensions').contentManager.entityManager.addSignedFileUrlsToAdmin();

  if (strapi.plugin('graphql')) {
    require('./graphql')({ strapi });
  }

  if (strapi.plugin('documentation')) {
    strapi
      .plugin('documentation')
      .service('override')
      .registerOverride(spec, {
        pluginOrigin: 'upload',
        excludeFromGeneration: ['upload'],
      });
  }
};

const createProvider = (config) => {
  const { providerOptions, actionOptions = {} } = config;

  const providerName = _.toLower(config.provider);
  let provider;

  let modulePath;
  try {
    modulePath = require.resolve(`@strapi/provider-upload-${providerName}`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      modulePath = providerName;
    } else {
      throw error;
    }
  }

  try {
    provider = require(modulePath);
  } catch (err) {
    if (err.code !== 'ERR_REQUIRE_ESM') {
      const newError = new Error(`Could not load upload provider "${providerName}".`);
      newError.stack = err.stack;
      throw newError;
    }
  }

  if (provider === undefined) {
    try {
      provider = (await import(modulePath)).default;
    } catch (err) {
      const newError = new Error(`Could not load upload provider "${providerName}".`);
      newError.stack = err.stack;
      throw newError;
    }
  }

  const providerInstance = provider.init(providerOptions);

  if (!providerInstance.delete) {
    throw new Error(`The upload provider "${providerName}" doesn't implement the delete method.`);
  }

  if (!providerInstance.upload && !providerInstance.uploadStream) {
    throw new Error(
      `The upload provider "${providerName}" doesn't implement the uploadStream nor the upload method.`
    );
  }

  if (!providerInstance.uploadStream) {
    process.emitWarning(
      `The upload provider "${providerName}" doesn't implement the uploadStream function. Strapi will fallback on the upload method. Some performance issues may occur.`
    );
  }

  const wrappedProvider = _.mapValues(providerInstance, (method, methodName) => {
    return async (file, options = actionOptions[methodName]) =>
      providerInstance[methodName](file, options);
  });

  return Object.assign(Object.create(baseProvider), wrappedProvider);
};

const baseProvider = {
  extend(obj) {
    Object.assign(this, obj);
  },
  checkFileSize(file, { sizeLimit }) {
    if (sizeLimit && kbytesToBytes(file.size) > sizeLimit) {
      throw new PayloadTooLargeError(
        `${file.name} exceeds size limit of ${bytesToHumanReadable(sizeLimit)}.`
      );
    }
  },
  getSignedUrl(file) {
    return file;
  },
  isPrivate() {
    return false;
  },
};
