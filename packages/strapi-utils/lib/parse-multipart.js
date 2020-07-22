const _ = require('lodash');

module.exports = (ctx) => {
  const { body = {}, files = {} } = ctx.request;

  if (!body.data) {
    throw strapi.errors.badRequest(
      "When using multipart/form-data you need to provide your data in a JSON 'data' field."
    );
  }

  let data;
  try {
    data = JSON.parse(body.data);
  } catch (error) {
    throw strapi.errors.badRequest("Invalid 'data' field. 'data' should be a valid JSON.");
  }

  const filesToUpload = Object.keys(files).reduce((acc, key) => {
    const fullPath = _.toPath(key);

    if (fullPath.length <= 1 || fullPath[0] !== 'files') {
      throw strapi.errors.badRequest(
        "When using multipart/form-data you need to provide your files by prefixing them with the 'files'."
      );
    }

    const path = _.tail(fullPath);
    acc[path.join('.')] = files[key];

    return acc;
  }, {});

  return {
    data,
    files: filesToUpload,
  };
};
