'use strict';

const {
  policy: { createPolicyFactory },
} = require('strapi-utils');
const { validateHasPermissionsInput } = require('../../validation/policies/hasPermissions');

module.exports = createPolicyFactory(
  actions => (ctx, next) => {
    const {
      state: { userAbility },
      params: { model },
    } = ctx;

    const isAuthorized = actions.every(action => userAbility.can(action, model));

    if (!isAuthorized) {
      throw strapi.errors.forbidden();
    }

    return next();
  },
  {
    validator: validateHasPermissionsInput,
    name: 'plugins::content-manager.hasPermissions',
  }
);
