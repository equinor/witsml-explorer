import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import Measure from "models/measure";
import { ObjectType } from "models/objectType";

export default interface Wellbore {
  uid: string;
  name: string;
  wellUid: string;
  wellName?: string;
  wellboreStatus?: string;
  wellboreType?: string;
  isActive?: boolean;
  number?: string;
  suffixAPI?: string;
  numGovt?: string;
  shape?: string;
  dTimeKickoff?: string;
  md?: Measure;
  tvd?: Measure;
  mdKickoff?: Measure;
  tvdKickoff?: Measure;
  mdPlanned?: Measure;
  tvdPlanned?: Measure;
  mdSubSeaPlanned?: Measure;
  tvdSubSeaPlanned?: Measure;
  dayTarget?: Measure;
  wellboreParentUid?: string;
  wellboreParentName?: string;
  wellborePurpose?: string;
  dateTimeCreation?: string;
  dateTimeLastChange?: string;
  itemState?: string;
  comments?: string;
  objectCount?: ExpandableObjectsCount;
}

export type ExpandableObjectsCount = Partial<Record<ObjectType, number>>;

export const calculateWellNodeId = (wellUid: string): string => {
  return `w=${wellUid};`;
};

export const calculateWellboreNodeId = (
  wellbore: Wellbore | { wellUid: string; uid: string }
): string => {
  return calculateWellNodeId(wellbore.wellUid) + `wb=${wellbore.uid};`;
};

export const calculateObjectGroupId = (
  wellbore: Wellbore | { wellUid: string; uid: string },
  objectType: ObjectType | string
): string => {
  return calculateWellboreNodeId(wellbore) + `ot=${objectType};`;
};

export const calculateLogTypeId = (
  wellbore: Wellbore | { wellUid: string; uid: string },
  logType: string
): string => {
  return calculateWellboreNodeId(wellbore) + `lt=${logType};`;
};

export const calculateLogTypeDepthId = (
  wellbore: Wellbore | { wellUid: string; uid: string }
): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_MD);
};

export const calculateLogTypeTimeId = (
  wellbore: Wellbore | { wellUid: string; uid: string }
): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_DATE_TIME);
};

export const calculateMultipleLogsNode = (
  wellbore: Wellbore | { wellUid: string; uid: string },
  logName: string
): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_MD) + `ln=${logName};`;
};

export const calculateMultipleLogsNodeItem = (
  wellbore: Wellbore | { wellUid: string; uid: string },
  logName: string,
  logUid: string
): string => {
  return (
    calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_MD) +
    `ln=${logName};` +
    `o=${logUid};`
  );
};

export const calculateObjectNodeId = (
  wellbore: Wellbore | { wellUid: string; uid: string },
  objectType: ObjectType | string,
  objectUid: string
): string => {
  return calculateObjectGroupId(wellbore, objectType) + `o=${objectUid};`;
};

export const getWellboreProperties = (
  wellbore: Wellbore
): Map<string, string> => {
  return new Map([
    ["Well", wellbore.wellName],
    ["UID Well", wellbore.wellUid],
    ["Wellbore", wellbore.name],
    ["UID Wellbore", wellbore.uid]
  ]);
};
