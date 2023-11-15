import * as React from 'react';

import {
  Box,
  Button,
  Divider,
  Flex,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalLayout,
  Tab,
  TabGroup,
  TabPanel,
  TabPanels,
  Tabs,
  Typography,
} from '@strapi/design-system';
import { Form, useRBACProvider } from '@strapi/helper-plugin';
import { Check } from '@strapi/icons';
import { Formik } from 'formik';
import { useIntl } from 'react-intl';

import useEditLocale from '../../hooks/useEditLocale';
import localeFormSchema from '../../schemas';
import { getTranslation } from '../../utils';

import AdvancedForm from './AdvancedForm';
import BaseForm from './BaseForm';

type ModelEditProps = {
  locale: {
    id: number;
    name: string;
    code: string;
    isDefault: boolean;
  };
  onClose: () => void;
};

const ModalEdit = ({ locale, onClose }: ModelEditProps) => {
  const { refetchPermissions } = useRBACProvider();
  const { isEditing, editLocale } = useEditLocale();
  const { formatMessage } = useIntl();

  const handleSubmit = async ({ displayName, isDefault }: any) => {
    await editLocale(locale.id, { name: displayName, isDefault });
    await refetchPermissions();
  };

  return (
    <ModalLayout onClose={onClose} labelledBy="edit-locale-title">
      <Formik
        initialValues={{
          code: locale?.code,
          displayName: locale?.name || '',
          isDefault: Boolean(locale?.isDefault),
        }}
        onSubmit={handleSubmit}
        validationSchema={localeFormSchema}
      >
        <Form>
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="edit-locale-title">
              {formatMessage({
                id: getTranslation('Settings.list.actions.edit'),
                defaultMessage: 'Edit a locale',
              })}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <TabGroup
              label={formatMessage({
                id: getTranslation('Settings.locales.modal.title'),
                defaultMessage: 'Configurations',
              })}
              id="tabs"
              variant="simple"
            >
              <Flex justifyContent="space-between">
                <Typography as="h2">
                  {formatMessage({
                    id: getTranslation('Settings.locales.modal.title'),
                    defaultMessage: 'Configurations',
                  })}
                </Typography>
                <Tabs>
                  <Tab>
                    {formatMessage({
                      id: getTranslation('Settings.locales.modal.base'),
                      defaultMessage: 'Basic settings',
                    })}
                  </Tab>
                  <Tab>
                    {formatMessage({
                      id: getTranslation('Settings.locales.modal.advanced'),
                      defaultMessage: 'Advanced settings',
                    })}
                  </Tab>
                </Tabs>
              </Flex>

              <Divider />

              <Box paddingTop={7} paddingBottom={7}>
                <TabPanels>
                  <TabPanel>
                    <BaseForm locale={locale} />
                  </TabPanel>
                  <TabPanel>
                    <AdvancedForm isDefaultLocale={Boolean(locale && locale.isDefault)} />
                  </TabPanel>
                </TabPanels>
              </Box>
            </TabGroup>
          </ModalBody>

          <ModalFooter
            startActions={
              <Button variant="tertiary" onClick={onClose}>
                {formatMessage({ id: 'app.components.Button.cancel' })}
              </Button>
            }
            endActions={
              <Button type="submit" startIcon={<Check />} disabled={isEditing}>
                {formatMessage({ id: 'global.save' })}
              </Button>
            }
          />
        </Form>
      </Formik>
    </ModalLayout>
  );
};

export default ModalEdit;
