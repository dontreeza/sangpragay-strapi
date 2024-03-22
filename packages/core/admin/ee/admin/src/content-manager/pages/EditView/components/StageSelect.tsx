import * as React from 'react';

import {
  SingleSelect,
  SingleSelectOption,
  Field,
  FieldError,
  FieldHint,
  Flex,
  Loader,
  Typography,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { useField } from '../../../../../../../admin/src/components/Form';
import { useDoc } from '../../../../../../../admin/src/content-manager/hooks/useDocument';
import { useNotification } from '../../../../../../../admin/src/features/Notifications';
import { useAPIErrorHandler } from '../../../../../../../admin/src/hooks/useAPIErrorHandler';
import { useLicenseLimits } from '../../../../hooks/useLicenseLimits';
import { LimitsModal } from '../../../../pages/SettingsPage/pages/ReviewWorkflows/components/LimitsModal';
import {
  CHARGEBEE_STAGES_PER_WORKFLOW_ENTITLEMENT_NAME,
  CHARGEBEE_WORKFLOW_ENTITLEMENT_NAME,
} from '../../../../pages/SettingsPage/pages/ReviewWorkflows/constants';
import { getStageColorByHex } from '../../../../pages/SettingsPage/pages/ReviewWorkflows/utils/colors';
import { useGetStagesQuery, useUpdateStageMutation } from '../../../../services/reviewWorkflows';

import { STAGE_ATTRIBUTE_NAME } from './constants';

import type { Data } from '@strapi/types';

export const StageSelect = () => {
  const { collectionType, model, id } = useDoc();
  const { formatMessage } = useIntl();
  const { _unstableFormatAPIError: formatAPIError } = useAPIErrorHandler();
  const { toggleNotification } = useNotification();
  const { data, isLoading } = useGetStagesQuery(
    {
      slug: collectionType,
      model: model,
      id: id!,
    },
    {
      skip: !id,
    }
  );

  const { meta, stages = [] } = data ?? {};

  const { getFeature } = useLicenseLimits();
  const [showLimitModal, setShowLimitModal] = React.useState<'stage' | 'workflow' | null>(null);

  const limits = getFeature<string>('review-workflows') ?? {};
  // it is possible to rely on initialData here, because it always will
  // be updated at the same time when modifiedData is updated, otherwise
  // the entity is flagged as modified
  const field = useField(STAGE_ATTRIBUTE_NAME);

  const activeWorkflowStage = field.value ?? null;

  const [updateStage, { error }] = useUpdateStageMutation();

  const handleChange = async (stageId: Data.ID) => {
    try {
      /**
       * If the current license has a limit:
       * check if the total count of workflows exceeds that limit and display
       * the limits modal.
       *
       * If the current license does not have a limit (e.g. offline license):
       * do nothing (for now).
       *
       */

      if (
        limits?.[CHARGEBEE_WORKFLOW_ENTITLEMENT_NAME] &&
        parseInt(limits[CHARGEBEE_WORKFLOW_ENTITLEMENT_NAME], 10) < (meta?.workflowCount ?? 0)
      ) {
        setShowLimitModal('workflow');

        /**
         * If the current license has a limit:
         * check if the total count of stages exceeds that limit and display
         * the limits modal.
         *
         * If the current license does not have a limit (e.g. offline license):
         * do nothing (for now).
         *
         */
      } else if (
        limits?.[CHARGEBEE_STAGES_PER_WORKFLOW_ENTITLEMENT_NAME] &&
        parseInt(limits[CHARGEBEE_STAGES_PER_WORKFLOW_ENTITLEMENT_NAME], 10) < stages.length
      ) {
        setShowLimitModal('stage');
      } else {
        if (id) {
          const res = await updateStage({
            model,
            id,
            slug: collectionType,
            data: { id: stageId },
          });

          if ('data' in res) {
            // initialData and modifiedData have to stay in sync, otherwise the entity would be flagged
            // as modified, which is what the boolean flag is for
            field.onChange(STAGE_ATTRIBUTE_NAME, res.data[STAGE_ATTRIBUTE_NAME]);

            toggleNotification({
              type: 'success',
              message: formatMessage({
                id: 'content-manager.reviewWorkflows.stage.notification.saved',
                defaultMessage: 'Review stage updated',
              }),
            });
          }
        }
      }
    } catch (error) {
      // react-query@v3: the error doesn't have to be handled here
      // see: https://github.com/TanStack/query/issues/121
    }
  };

  const { themeColorName } = getStageColorByHex(activeWorkflowStage?.color) ?? {};

  return (
    <>
      <Field
        hint={
          stages.length === 0 &&
          formatMessage({
            id: 'content-manager.reviewWorkflows.stages.no-transition',
            defaultMessage: 'You don’t have the permission to update this stage.',
          })
        }
        name={STAGE_ATTRIBUTE_NAME}
        id={STAGE_ATTRIBUTE_NAME}
      >
        <Flex direction="column" gap={2} alignItems="stretch">
          <SingleSelect
            disabled={stages.length === 0}
            error={(error && formatAPIError(error)) || undefined}
            name={STAGE_ATTRIBUTE_NAME}
            id={STAGE_ATTRIBUTE_NAME}
            value={activeWorkflowStage?.id}
            onChange={handleChange}
            label={formatMessage({
              id: 'content-manager.reviewWorkflows.stage.label',
              defaultMessage: 'Review stage',
            })}
            placeholder={formatMessage({
              id: 'content-manager.reviewWorkflows.assignee.placeholder',
              defaultMessage: 'Select…',
            })}
            startIcon={
              activeWorkflowStage && (
                <Flex
                  as="span"
                  height={2}
                  background={activeWorkflowStage?.color}
                  borderColor={themeColorName === 'neutral0' ? 'neutral150' : undefined}
                  hasRadius
                  shrink={0}
                  width={2}
                  marginRight="-3px"
                />
              )
            }
            // @ts-expect-error – `customizeContent` is not correctly typed in the DS.
            customizeContent={() => (
              <Flex as="span" justifyContent="space-between" alignItems="center" width="100%">
                <Typography textColor="neutral800" ellipsis>
                  {activeWorkflowStage?.name ?? ''}
                </Typography>
                {isLoading ? (
                  <Loader small style={{ display: 'flex' }} data-testid="loader" />
                ) : null}
              </Flex>
            )}
          >
            {stages.map(({ id, color, name }) => {
              const { themeColorName } = getStageColorByHex(color) ?? {};

              return (
                <SingleSelectOption
                  key={id}
                  startIcon={
                    <Flex
                      height={2}
                      background={color}
                      borderColor={themeColorName === 'neutral0' ? 'neutral150' : undefined}
                      hasRadius
                      shrink={0}
                      width={2}
                    />
                  }
                  value={id}
                  textValue={name}
                >
                  {name}
                </SingleSelectOption>
              );
            })}
          </SingleSelect>
          <FieldHint />
          <FieldError />
        </Flex>
      </Field>

      <LimitsModal.Root
        isOpen={showLimitModal === 'workflow'}
        onClose={() => setShowLimitModal(null)}
      >
        <LimitsModal.Title>
          {formatMessage({
            id: 'content-manager.reviewWorkflows.workflows.limit.title',
            defaultMessage: 'You’ve reached the limit of workflows in your plan',
          })}
        </LimitsModal.Title>

        <LimitsModal.Body>
          {formatMessage({
            id: 'content-manager.reviewWorkflows.workflows.limit.body',
            defaultMessage: 'Delete a workflow or contact Sales to enable more workflows.',
          })}
        </LimitsModal.Body>
      </LimitsModal.Root>

      <LimitsModal.Root isOpen={showLimitModal === 'stage'} onClose={() => setShowLimitModal(null)}>
        <LimitsModal.Title>
          {formatMessage({
            id: 'content-manager.reviewWorkflows.stages.limit.title',
            defaultMessage: 'You have reached the limit of stages for this workflow in your plan',
          })}
        </LimitsModal.Title>

        <LimitsModal.Body>
          {formatMessage({
            id: 'content-manager.reviewWorkflows.stages.limit.body',
            defaultMessage: 'Try deleting some stages or contact Sales to enable more stages.',
          })}
        </LimitsModal.Body>
      </LimitsModal.Root>
    </>
  );
};
