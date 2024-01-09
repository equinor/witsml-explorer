import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import BhaRun from "models/bhaRun";
import ChangeLog from "models/changeLog";
import FluidsReport from "models/fluidsReport";
import FormationMarker from "models/formationMarker";
import LogObject from "models/logObject";
import GeologyInterval from "./geologyInterval";
import Measure from "models/measure";
import MessageObject from "models/messageObject";
import MudLog from "models/mudLog";
import {
  ObjectType,
  ObjectTypeToModel,
  pluralizeObjectType
} from "models/objectType";
import Rig from "models/rig";
import RiskObject from "models/riskObject";
import Trajectory from "models/trajectory";
import Tubular from "models/tubular";
import WbGeometryObject from "models/wbGeometry";

export interface WellboreProperties {
  uid: string;
  name: string;
  wellUid: string;
  wellName?: string;
  wellStatus: string;
  wellType: string;
  isActive: boolean;
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

export interface WellboreObjects {
  bhaRuns?: BhaRun[];
  changeLogs?: ChangeLog[];
  fluidsReports?: FluidsReport[];
  formationMarkers?: FormationMarker[];
  logs?: LogObject[];
  rigs?: Rig[];
  trajectories?: Trajectory[];
  messages?: MessageObject[];
  mudLogs?: MudLog[];
  tubulars?: Tubular[];
  risks?: RiskObject[];
  wbGeometries?: WbGeometryObject[];
}

export type ExpandableObjectsCount = Partial<Record<ObjectType, number>>;

export default interface Wellbore extends WellboreProperties, WellboreObjects {}

export function emptyWellbore(): Wellbore {
  return {
    uid: "",
    name: "",
    wellUid: "",
    wellName: "",
    wellStatus: "",
    wellType: "",
    isActive: false,
    wellboreParentUid: "",
    wellboreParentName: "",
    wellborePurpose: "unknown",
    dateTimeCreation: "",
    dateTimeLastChange: "",
    itemState: "",
    bhaRuns: [],
    changeLogs: [],
    fluidsReports: [],
    formationMarkers: [],
    logs: [],
    rigs: [],
    trajectories: [],
    tubulars: [],
    messages: [],
    mudLogs: [],
    risks: [],
    wbGeometries: [],
    objectCount: null
  };
}

export function wellboreHasChanges(
  wellbore: WellboreProperties,
  updatedWellbore: WellboreProperties
): boolean {
  return JSON.stringify(wellbore) !== JSON.stringify(updatedWellbore);
}

export const calculateWellboreNodeId = (
  wellbore: Wellbore | { wellUid: string; uid: string }
): string => {
  return wellbore?.wellUid + wellbore?.uid;
};

export const calculateObjectGroupId = (
  wellbore: Wellbore,
  objectType: ObjectType
): string => {
  return calculateWellboreNodeId(wellbore) + objectType;
};

export const calculateLogTypeId = (
  wellbore: Wellbore,
  logType: string
): string => {
  return calculateWellboreNodeId(wellbore) + logType;
};

export const calculateLogTypeDepthId = (wellbore: Wellbore): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_MD);
};

export const calculateLogTypeTimeId = (wellbore: Wellbore): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_DATE_TIME);
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

export function objectTypeToWellboreObjects(
  objectType: ObjectType
): keyof WellboreObjects {
  return (objectType.charAt(0).toLowerCase() +
    pluralizeObjectType(objectType).slice(1)) as keyof WellboreObjects;
}
export function getObjectsFromWellbore<Key extends ObjectType>(
  wellbore: Wellbore,
  objectType: Key
): ObjectTypeToModel[Key][] {
  return wellbore[
    objectTypeToWellboreObjects(objectType)
  ] as ObjectTypeToModel[Key][];
}

export function getGeologyIntervalLength(
  wellbore: Wellbore,
  objectType: string
): GeologyInterval[] | null {
  const geologylength = wellbore?.mudLogs?.filter(
    (mudlogIndex) => mudlogIndex.uid === objectType
  );
  if (
    geologylength?.length &&
    geologylength[0]?.geologyInterval &&
    geologylength[0]?.geologyInterval?.length
  ) {
    return geologylength[0]?.geologyInterval;
  } else {
    return null;
  }
}

export function getObjectFromWellbore<Key extends ObjectType>(
  wellbore: Wellbore,
  uid: string,
  objectType: Key
): ObjectTypeToModel[Key] {
  const objects = getObjectsFromWellbore(wellbore, objectType);
  return objects?.find((object) => object.uid === uid);
}
