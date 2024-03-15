import * as React from 'react';

import { Box, Flex, SkipToContent } from '@strapi/design-system';
import { AppInfoProvider, useGuidedTour, useTracking } from '@strapi/helper-plugin';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router-dom';
import lt from 'semver/functions/lt';
import valid from 'semver/functions/valid';

import packageJSON from '../../../package.json';
import { GuidedTourModal } from '../components/GuidedTour/Modal';
import { LeftMenu } from '../components/LeftMenu';
import { NpsSurvey } from '../components/NpsSurvey';
import { Onboarding } from '../components/Onboarding';
import { Page } from '../components/PageHelpers';
import { PluginsInitializer } from '../components/PluginsInitializer';
import { PrivateRoute } from '../components/PrivateRoute';
import { RBACProvider } from '../components/RBACProvider';
import { useIsHistoryRoute } from '../content-manager/history/routes';
import { useAuth } from '../features/Auth';
import { useConfiguration } from '../features/Configuration';
import { useMenu } from '../hooks/useMenu';
import { useOnce } from '../hooks/useOnce';
import { useInformationQuery } from '../services/admin';
import { useGetMyPermissionsQuery } from '../services/auth';
import { hashAdminUserEmail } from '../utils/hashAdminUserEmail';
import { getDisplayName } from '../utils/users';

const strapiVersion = packageJSON.version;

const AdminLayout = () => {
  const { setGuidedTourVisibility } = useGuidedTour();
  const { formatMessage } = useIntl();
  const userInfo = useAuth('AuthenticatedApp', (state) => state.user);
  const [userId, setUserId] = React.useState<string>();
  const { showReleaseNotification } = useConfiguration('AuthenticatedApp');

  const { data: appInfo, isLoading: isLoadingAppInfo } = useInformationQuery();
  /**
   * TODO: in V5 remove the `RBACProvider` and fire this in the Auth provider instead.
   */
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    refetch,
  } = useGetMyPermissionsQuery();

  const [tagName, setTagName] = React.useState<string>(strapiVersion);

  React.useEffect(() => {
    if (showReleaseNotification) {
      fetch('https://api.github.com/repos/strapi/strapi/releases/latest')
        .then(async (res) => {
          if (!res.ok) {
            throw new Error();
          }

          const response = (await res.json()) as { tag_name: string | null | undefined };

          if (!response.tag_name) {
            throw new Error();
          }

          setTagName(response.tag_name);
        })
        .catch(() => {
          /**
           * silence is golden & we'll use the strapiVersion as a fallback
           */
        });
    }
  }, [showReleaseNotification]);

  const userRoles = useAuth('AuthenticatedApp', (state) => state.user?.roles);

  React.useEffect(() => {
    if (userRoles) {
      const isUserSuperAdmin = userRoles.find(({ code }) => code === 'strapi-super-admin');

      if (isUserSuperAdmin && appInfo?.autoReload) {
        setGuidedTourVisibility(true);
      }
    }
  }, [userRoles, appInfo?.autoReload, setGuidedTourVisibility]);

  React.useEffect(() => {
    hashAdminUserEmail(userInfo).then((id) => {
      if (id) {
        setUserId(id);
      }
    });
  }, [userInfo]);

  const { trackUsage } = useTracking();

  const {
    isLoading: isLoadingMenu,
    generalSectionLinks,
    pluginsSectionLinks,
  } = useMenu(checkLatestStrapiVersion(strapiVersion, tagName), permissions ?? []);
  const { showTutorials } = useConfiguration('Admin');

  /**
   * Make sure the event is only send once after accessing the admin panel
   * and not at runtime for example when regenerating the permissions with the ctb
   * or with i18n
   */
  useOnce(() => {
    trackUsage('didAccessAuthenticatedAdministration');
  });

  // Check if we're on a history route to know if we should render the left menu
  const isHistoryRoute = useIsHistoryRoute();

  // We don't need to wait for the release query to be fetched before rendering the plugins
  // however, we need the appInfos and the permissions
  if (isLoadingMenu || isLoadingAppInfo || isLoadingPermissions) {
    return <Page.Loading />;
  }

  const refetchPermissions = async () => {
    await refetch();
  };

  return (
    <AppInfoProvider
      {...appInfo}
      userId={userId}
      latestStrapiReleaseTag={tagName}
      setUserDisplayName={() => {}}
      shouldUpdateStrapi={checkLatestStrapiVersion(strapiVersion, tagName)}
      userDisplayName={getDisplayName(userInfo, formatMessage) ?? ''}
    >
      <RBACProvider permissions={permissions ?? []} refetchPermissions={refetchPermissions}>
        <NpsSurvey />
        <PluginsInitializer>
          <DndProvider backend={HTML5Backend}>
            <Box background="neutral100">
              <SkipToContent>
                {formatMessage({ id: 'skipToContent', defaultMessage: 'Skip to content' })}
              </SkipToContent>
              <Flex alignItems="flex-start">
                {!isHistoryRoute && (
                  <LeftMenu
                    generalSectionLinks={generalSectionLinks}
                    pluginsSectionLinks={pluginsSectionLinks}
                  />
                )}
                <Box flex={1}>
                  <Outlet />
                  <GuidedTourModal />
                  {showTutorials && <Onboarding />}
                </Box>
              </Flex>
            </Box>
          </DndProvider>
        </PluginsInitializer>
      </RBACProvider>
    </AppInfoProvider>
  );
};

const PrivateAdminLayout = () => {
  return (
    <PrivateRoute>
      <AdminLayout />
    </PrivateRoute>
  );
};

const checkLatestStrapiVersion = (
  currentPackageVersion: string,
  latestPublishedVersion: string = ''
): boolean => {
  if (!valid(currentPackageVersion) || !valid(latestPublishedVersion)) {
    return false;
  }

  return lt(currentPackageVersion, latestPublishedVersion);
};

export { AdminLayout, PrivateAdminLayout };
