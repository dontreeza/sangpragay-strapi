import { useRBAC } from '@strapi/admin/strapi-admin';
import { unstable_useDocumentLayout as useDocumentLayout } from '@strapi/content-manager/strapi-admin';
import { Box, Flex, Typography } from '@strapi/design-system';
import { UID } from '@strapi/types';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { PERMISSIONS } from '../constants';
import { useGetReleasesForEntryQuery } from '../services/release';
import { getTimezoneOffset } from '../utils/time';

import { ReleaseActionMenu } from './ReleaseActionMenu';

import type { PanelComponent } from '@strapi/content-manager/strapi-admin';

const Panel: PanelComponent = () => {
  const {
    slug: contentTypeUid = '',
    id,
    locale,
  } = useParams<{
    slug: UID.ContentType;
    id: string;
    locale: string;
  }>();

  const {
    edit: { options },
  } = useDocumentLayout(contentTypeUid);
  const { formatMessage, formatDate, formatTime } = useIntl();
  const { collectionType } = useParams<{ collectionType: string }>();

  const { allowedActions } = useRBAC(PERMISSIONS);
  const { canRead, canDeleteAction } = allowedActions;

  const response = useGetReleasesForEntryQuery({
    contentTypeUid: contentTypeUid,
    documentId: id,
    locale,
    hasEntryAttached: true,
  });
  const releases = response.data?.data;

  const getReleaseColorVariant = (
    actionType: 'publish' | 'unpublish',
    shade: '100' | '200' | '600'
  ) => {
    if (actionType === 'unpublish') {
      return `secondary${shade}`;
    }

    return `success${shade}`;
  };

  // Project is not EE or contentType does not have draftAndPublish enabled
  if (!window.strapi.isEE || !options?.draftAndPublish || !canRead) {
    return null;
  }

  if (collectionType === 'collection-types' && (!id || id === 'create')) {
    return null;
  }

  return {
    title: formatMessage({
      id: 'content-releases.plugin.name',
      defaultMessage: 'Releases',
    }),
    content: (
      <Flex direction="column" alignItems="stretch" gap={3} width="100%">
        {releases?.map((release: any) => (
          <Flex
            key={release.id}
            direction="column"
            alignItems="start"
            borderWidth="1px"
            borderStyle="solid"
            borderColor={getReleaseColorVariant(release.actions[0].type, '200')}
            overflow="hidden"
            hasRadius
          >
            <Box
              paddingTop={3}
              paddingBottom={3}
              paddingLeft={4}
              paddingRight={4}
              background={getReleaseColorVariant(release.actions[0].type, '100')}
              width="100%"
            >
              <Typography
                fontSize={1}
                variant="pi"
                textColor={getReleaseColorVariant(release.actions[0].type, '600')}
              >
                {formatMessage(
                  {
                    id: 'content-releases.content-manager-edit-view.list-releases.title',
                    defaultMessage:
                      '{isPublish, select, true {Will be published in} other {Will be unpublished in}}',
                  },
                  { isPublish: release.actions[0].type === 'publish' }
                )}
              </Typography>
            </Box>
            <Flex padding={4} direction="column" gap={2} width="100%" alignItems="flex-start">
              <Typography fontSize={2} fontWeight="bold" variant="omega" textColor="neutral700">
                {release.name}
              </Typography>
              {release.scheduledAt && release.timezone && (
                <Typography variant="pi" textColor="neutral600">
                  {formatMessage(
                    {
                      id: 'content-releases.content-manager-edit-view.scheduled.date',
                      defaultMessage: '{date} at {time} ({offset})',
                    },
                    {
                      date: formatDate(new Date(release.scheduledAt), {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: release.timezone,
                      }),
                      time: formatTime(new Date(release.scheduledAt), {
                        hourCycle: 'h23',
                        timeZone: release.timezone,
                      }),
                      offset: getTimezoneOffset(release.timezone, new Date(release.scheduledAt)),
                    }
                  )}
                </Typography>
              )}
              {canDeleteAction ? (
                <ReleaseActionMenu.Root hasTriggerBorder>
                  <ReleaseActionMenu.EditReleaseItem releaseId={release.id} />
                  <ReleaseActionMenu.DeleteReleaseActionItem
                    releaseId={release.id}
                    actionId={release.actions[0].id}
                  />
                </ReleaseActionMenu.Root>
              ) : null}
            </Flex>
          </Flex>
        ))}
      </Flex>
    ),
  };
};

export { Panel };