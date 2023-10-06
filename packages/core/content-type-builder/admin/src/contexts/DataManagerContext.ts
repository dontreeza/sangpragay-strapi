/* eslint-disable check-file/filename-naming-convention */
import { createContext } from 'react';

import type { SchemaType } from '../types';
import type { UID } from '@strapi/types';

export interface CustomFieldAttributeParams {
  attributeToSet: Record<string, any>;
  forTarget: SchemaType;
  targetUid: UID.Any;
  initialAttribute: Record<string, any>;
}
interface DataManagerContextValue {
  addAttribute: (
    attributeToSet: Record<string, any>,
    forTarget: SchemaType,
    targetUid: UID.Any,
    isEditing?: boolean,
    initialAttribute?: Record<string, any>,
    shouldAddComponentToData?: boolean
  ) => void;
  addCustomFieldAttribute: (params: CustomFieldAttributeParams) => void;
  editCustomFieldAttribute: (params: CustomFieldAttributeParams) => void;
  addCreatedComponentToDynamicZone: (dynamicZoneTarget: string, componentsToAdd: string[]) => void;
  createSchema: (
    data: Record<string, any>,
    schemaType: SchemaType,
    uid: UID.Any,
    componentCategory: string,
    shouldAddComponentToData?: boolean
  ) => void;
  changeDynamicZoneComponents: (dynamicZoneTarget: string, newComponents: string[]) => void;
  removeAttribute: (
    mainDataKey: string,
    attributeToRemoveName: string,
    componentUid?: string
  ) => void;
  deleteCategory: (categoryUid: string) => void;
  deleteData: () => void;
  editCategory: (categoryUid: string, body: any) => void;
  removeComponentFromDynamicZone: (dzName: string, componentToRemoveIndex: number) => void;
  setModifiedData: () => void;
  sortedContentTypesList: any[]; // Define the actual type
  submitData: (additionalContentTypeData: Record<string, any>) => void;
  updateSchema: (
    data: Record<string, any>,
    schemaType: SchemaType,
    componentUID: UID.Component
  ) => void;
  components: Record<string, any>;
  componentsGroupedByCategory: Record<string, any[]>;
  componentsThatHaveOtherComponentInTheirAttributes: any[]; // Define the actual type
  contentTypes: Record<string, any>;
  initialData: Record<string, any>;
  isInContentTypeView: boolean;
  isInDevelopmentMode: boolean;
  modifiedData: Record<string, any>;
  nestedComponents: any[]; // Define the actual type
  reservedNames: Record<string, any>;
  allComponentsCategories: any[];
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const DataManagerContext = createContext<DataManagerContextValue>();
