import * as React from 'react';

import { SerializedError } from '@reduxjs/toolkit';
import {
  type TrackingEvent,
  useAPIErrorHandler,
  useNotification,
  useTracking,
} from '@strapi/helper-plugin';

import { BaseQueryError } from '../../utils/baseQuery';
import {
  useCloneDocumentMutation,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useDiscardDocumentMutation,
  useLazyGetDocumentQuery,
  usePublishDocumentMutation,
  useUnpublishDocumentMutation,
  useUpdateDocumentMutation,
} from '../services/documents';
import { getTranslation } from '../utils/translations';

import type { Document } from './useDocument';
import type { Contracts } from '@strapi/plugin-content-manager/_internal/shared';
import type { MessageDescriptor } from 'react-intl';

const DEFAULT_UNEXPECTED_ERROR_MSG = {
  id: 'notification.error',
  defaultMessage: 'An error occurred, please try again',
} satisfies MessageDescriptor;

type OperationResponse<TResponse extends { data: any; meta: any; error?: any }> =
  | Pick<TResponse, 'data' | 'meta'>
  | { error: BaseQueryError | SerializedError };

type UseDocumentActions = () => {
  clone: (
    args: {
      model: string;
      id: string;
      params?: object;
    },
    document: Omit<Document, 'id'>,
    trackerProperty?: Extract<
      TrackingEvent,
      { name: 'willCreateEntry' | 'didCreateEntry' | 'didNotCreateEntry' }
    >['properties']
  ) => Promise<OperationResponse<Contracts.CollectionTypes.Clone.Response>>;
  create: (
    args: {
      model: string;
      params?: object;
    },
    document: Omit<Document, 'id'>,
    trackerProperty?: Extract<
      TrackingEvent,
      { name: 'willCreateEntry' | 'didCreateEntry' | 'didNotCreateEntry' }
    >['properties']
  ) => Promise<OperationResponse<Contracts.CollectionTypes.Create.Response>>;
  delete: (
    args: {
      collectionType: string;
      model: string;
      id?: string;
    },
    trackerProperty?: Extract<
      TrackingEvent,
      { name: 'willDeleteEntry' | 'didDeleteEntry' | 'didNotDeleteEntry' }
    >['properties']
  ) => Promise<OperationResponse<Contracts.CollectionTypes.Delete.Response>>;
  discard: (args: {
    collectionType: string;
    model: string;
    id?: string;
    params?: object;
  }) => Promise<OperationResponse<Contracts.CollectionTypes.Discard.Response>>;
  getDocument: (args: {
    collectionType: string;
    model: string;
    id?: string;
    params?: object;
  }) => Promise<Contracts.CollectionTypes.FindOne.Response | undefined>;
  publish: (
    args: {
      collectionType: string;
      model: string;
      id?: string;
      params?: object;
    },
    document: Partial<Document>
  ) => Promise<OperationResponse<Contracts.CollectionTypes.Publish.Response>>;
  update: (
    args: {
      collectionType: string;
      model: string;
      id?: string;
      params?: object;
    },
    document: Partial<Document>,
    trackerProperty?: Extract<
      TrackingEvent,
      { name: 'willEditEntry' | 'didEditEntry' | 'didNotEditEntry' }
    >['properties']
  ) => Promise<OperationResponse<Contracts.CollectionTypes.Update.Response>>;
  unpublish: (
    args: {
      collectionType: string;
      model: string;
      id?: string;
    },
    discardDraft?: boolean
  ) => Promise<OperationResponse<Contracts.CollectionTypes.Unpublish.Response>>;
};

type IUseDocumentActs = ReturnType<UseDocumentActions>;

/**
 * @alpha
 * @public
 * @description Contains all the operations that can be performed on a single document.
 * Designed to be able to be used anywhere within a Strapi app. The hooks will handle
 * notifications should the operation fail, however the response is always returned incase
 * the user needs to handle side-effects.
 * @example
 * ```tsx
 * import { Form } from '@strapi/admin/admin';
 *
 * const { id, model, collectionType } = useParams<{ id: string; model: string; collectionType: string }>();
 * const { update } = useDocumentActions();
 *
 * const handleSubmit = async (data) => {
 *  await update({ collectionType, model, id }, data);
 * }
 *
 * return <Form method="PUT" onSubmit={handleSubmit} />
 * ```
 *
 * @see {@link https://contributor.strapi.io/docs/core/content-manager/hooks/use-document-operations} for more information
 */
const useDocumentActions: UseDocumentActions = () => {
  const toggleNotification = useNotification();
  const { trackUsage } = useTracking();
  const { _unstableFormatAPIError: formatAPIError } = useAPIErrorHandler();

  const [deleteDocument] = useDeleteDocumentMutation();
  const _delete: IUseDocumentActs['delete'] = React.useCallback(
    async ({ collectionType, model, id }, trackerProperty) => {
      try {
        trackUsage('willDeleteEntry', trackerProperty);

        const res = await deleteDocument({
          collectionType,
          model,
          id,
        });

        if ('error' in res) {
          toggleNotification({
            type: 'warning',
            message: formatAPIError(res.error),
          });

          return { error: res.error };
        }

        toggleNotification({
          type: 'success',
          message: {
            id: getTranslation('success.record.delete'),
            defaultMessage: 'Deleted document',
          },
        });

        trackUsage('didDeleteEntry', trackerProperty);

        return res.data;
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        trackUsage('didNotDeleteEntry', { error: err, ...trackerProperty });

        throw err;
      }
    },
    [trackUsage, deleteDocument, toggleNotification, formatAPIError]
  );

  const [discardDocument] = useDiscardDocumentMutation();
  const discard: IUseDocumentActs['discard'] = React.useCallback(
    async ({ collectionType, model, id }) => {
      try {
        const res = await discardDocument({
          collectionType,
          model,
          id,
        });

        if ('error' in res) {
          toggleNotification({
            type: 'warning',
            message: formatAPIError(res.error),
          });

          return { error: res.error };
        }

        toggleNotification({
          type: 'success',
          message: {
            id: 'content-manager.success.record.discard',
            defaultMessage: 'Changes discarded',
          },
        });

        return res.data;
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        throw err;
      }
    },
    []
  );

  const [publishDocument] = usePublishDocumentMutation();
  const publish: IUseDocumentActs['publish'] = React.useCallback(
    async ({ collectionType, model, id, params }, data) => {
      try {
        trackUsage('willPublishEntry');

        const res = await publishDocument({
          collectionType,
          model,
          id,
          data,
          params,
        });

        if ('error' in res) {
          toggleNotification({ type: 'warning', message: formatAPIError(res.error) });
          return { error: res.error };
        }

        trackUsage('didPublishEntry');

        toggleNotification({
          type: 'success',
          message: {
            id: getTranslation('success.record.publish'),
            defaultMessage: 'Published document',
          },
        });

        return res.data;
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        throw err;
      }
    },
    [trackUsage, publishDocument, toggleNotification, formatAPIError]
  );

  const [updateDocument] = useUpdateDocumentMutation();
  const update: IUseDocumentActs['update'] = React.useCallback(
    async ({ collectionType, model, id, params }, data, trackerProperty) => {
      try {
        trackUsage('willEditEntry', trackerProperty);

        const res = await updateDocument({
          collectionType,
          model,
          id,
          data,
          params,
        });

        if ('error' in res) {
          toggleNotification({ type: 'warning', message: formatAPIError(res.error) });

          trackUsage('didNotEditEntry', { error: res.error, ...trackerProperty });

          return { error: res.error };
        }

        trackUsage('didEditEntry', trackerProperty);
        toggleNotification({
          type: 'success',
          message: { id: getTranslation('success.record.save') },
        });

        return res.data;
      } catch (err) {
        trackUsage('didNotEditEntry', { error: err, ...trackerProperty });

        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        throw err;
      }
    },
    [trackUsage, updateDocument, toggleNotification, formatAPIError]
  );

  const [unpublishDocument] = useUnpublishDocumentMutation();
  const unpublish: IUseDocumentActs['unpublish'] = React.useCallback(
    async ({ collectionType, model, id }, discardDraft = false) => {
      try {
        trackUsage('willUnpublishEntry');

        const res = await unpublishDocument({
          collectionType,
          model,
          id,
          data: {
            discardDraft,
          },
        });

        if ('error' in res) {
          toggleNotification({ type: 'warning', message: formatAPIError(res.error) });

          return { error: res.error };
        }

        trackUsage('didUnpublishEntry');

        toggleNotification({
          type: 'success',
          message: { id: getTranslation('success.record.unpublish') },
        });

        return res.data;
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        throw err;
      }
    },
    [trackUsage, unpublishDocument, toggleNotification, formatAPIError]
  );

  const [createDocument] = useCreateDocumentMutation();
  const create: IUseDocumentActs['create'] = React.useCallback(
    async ({ model, params }, data, trackerProperty) => {
      try {
        const res = await createDocument({
          model,
          data,
          params,
        });

        if ('error' in res) {
          toggleNotification({ type: 'warning', message: formatAPIError(res.error) });

          trackUsage('didNotCreateEntry', { error: res.error, ...trackerProperty });

          return { error: res.error };
        }

        trackUsage('didCreateEntry', trackerProperty);

        toggleNotification({
          type: 'success',
          message: { id: getTranslation('success.record.save') },
        });

        return res.data;
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        trackUsage('didNotCreateEntry', { error: err, ...trackerProperty });

        throw err;
      }
    },
    [createDocument, formatAPIError, toggleNotification, trackUsage]
  );

  const [cloneDocument] = useCloneDocumentMutation();
  const clone: IUseDocumentActs['clone'] = React.useCallback(
    async ({ model, id, params }, body, trackerProperty) => {
      try {
        const { id: _id, ...restBody } = body;

        /**
         * If we're cloning we want to post directly to this endpoint
         * so that the relations even if they're not listed in the EditView
         * are correctly attached to the entry.
         */
        const res = await cloneDocument({
          model,
          sourceId: id,
          data: restBody,
          params,
        });

        if ('error' in res) {
          toggleNotification({ type: 'warning', message: formatAPIError(res.error) });

          trackUsage('didNotCreateEntry', { error: res.error, ...trackerProperty });

          return { error: res.error };
        }

        trackUsage('didCreateEntry', trackerProperty);
        toggleNotification({
          type: 'success',
          message: { id: getTranslation('success.record.save') },
        });

        return res.data;
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: DEFAULT_UNEXPECTED_ERROR_MSG,
        });

        trackUsage('didNotCreateEntry', { error: err, ...trackerProperty });

        throw err;
      }
    },
    [cloneDocument, trackUsage, toggleNotification, formatAPIError]
  );

  const [getDoc] = useLazyGetDocumentQuery();
  const getDocument: IUseDocumentActs['getDocument'] = React.useCallback(
    async (args) => {
      const { data } = await getDoc(args);

      return data;
    },
    [getDoc]
  );

  return {
    clone,
    create,
    delete: _delete,
    discard,
    getDocument,
    publish,
    unpublish,
    update,
  } satisfies IUseDocumentActs;
};

export { useDocumentActions };
export type { UseDocumentActions, OperationResponse };
