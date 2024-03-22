import type { Core } from '@strapi/types';

import executeCERegister from '../../../server/src/register';
import migrateAuditLogsTable from './migrations/audit-logs-table';
import migrateReviewWorkflowStagesColor from './migrations/review-workflows-stages-color';
import migrateReviewWorkflowStagesRoles from './migrations/review-workflows-stages-roles';
import migrateReviewWorkflowName from './migrations/review-workflows-workflow-name';
import migrateWorkflowsContentTypes from './migrations/review-workflows-content-types';
import migrateStageAttribute from './migrations/review-workflows-stage-attribute';
import migrateDeletedCTInWorkflows from './migrations/review-workflows-deleted-ct-in-workflows';
import createAuditLogsService from './services/audit-logs';
import reviewWorkflowsMiddlewares from './middlewares/review-workflows';
import { getService } from './utils';

export default async ({ strapi }: { strapi: Core.LoadedStrapi }) => {
  const auditLogsIsEnabled = strapi.config.get('admin.auditLogs.enabled', true);

  if (auditLogsIsEnabled) {
    strapi.hook('strapi::content-types.beforeSync').register(migrateAuditLogsTable);
    const auditLogsService = createAuditLogsService(strapi);
    strapi.add('audit-logs', auditLogsService);
    await auditLogsService.register();
  }
  if (strapi.ee.features.isEnabled('review-workflows')) {
    strapi.hook('strapi::content-types.beforeSync').register(migrateStageAttribute);
    strapi
      .hook('strapi::content-types.afterSync')
      .register(migrateReviewWorkflowStagesColor)
      .register(migrateReviewWorkflowStagesRoles)
      .register(migrateReviewWorkflowName)
      .register(migrateWorkflowsContentTypes)
      .register(migrateDeletedCTInWorkflows);
    const reviewWorkflowService = getService('review-workflows');

    reviewWorkflowsMiddlewares.contentTypeMiddleware(strapi);
    await reviewWorkflowService.register(strapi.ee.features.get('review-workflows'));
  }
  await executeCERegister({ strapi });
};
