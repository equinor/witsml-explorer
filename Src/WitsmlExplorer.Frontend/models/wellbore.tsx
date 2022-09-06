import { WITSML_INDEX_TYPE_DATE_TIME, WITSML_INDEX_TYPE_MD } from "../components/Constants";
import BhaRun from "./bhaRun";
import LogObject from "./logObject";
import Measure from "./measure";
import MessageObject from "./messageObject";
import Rig from "./rig";
import RiskObject from "./riskObject";
import Trajectory from "./trajectory";
import Tubular from "./tubular";
import WbGeometryObject from "./wbGeometry";

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
  dTimeKickoff?: Date;
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
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
  itemState?: string;
}

export default interface Wellbore extends WellboreProperties {
  bhaRuns?: BhaRun[];
  logs?: LogObject[];
  rigs?: Rig[];
  trajectories?: Trajectory[];
  messages?: MessageObject[];
  tubulars?: Tubular[];
  risks?: RiskObject[];
  wbGeometrys?: WbGeometryObject[];
}

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
    dateTimeCreation: null,
    dateTimeLastChange: null,
    itemState: "",
    bhaRuns: [],
    logs: [],
    rigs: [],
    trajectories: [],
    tubulars: [],
    messages: [],
    risks: [],
    wbGeometrys: []
  };
}

export function wellboreHasChanges(wellbore: WellboreProperties, updatedWellbore: WellboreProperties): boolean {
  return JSON.stringify(wellbore) !== JSON.stringify(updatedWellbore);
}

export const calculateWellboreNodeId = (wellbore: Wellbore): string => {
  return wellbore.wellUid + wellbore.uid;
};

export const calculateBhaRunGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "bhaRuns";
};

export const calculateRigGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "rigs";
};

export const calculateMessageGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "messages";
};

export const calculateRiskGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "risks";
};

export const calculateWbGeometryGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "wbGeometrys";
};

export const calculateLogGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "logs";
};

export const calculateTrajectoryGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "trajectories";
};

export const calculateTubularGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "tubulars";
};

export const calculateLogTypeId = (wellbore: Wellbore, logType: string): string => {
  return calculateWellboreNodeId(wellbore) + logType;
};

export const calculateLogTypeDepthId = (wellbore: Wellbore): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_MD);
};

export const calculateLogTypeTimeId = (wellbore: Wellbore): string => {
  return calculateLogTypeId(wellbore, WITSML_INDEX_TYPE_DATE_TIME);
};

export const getWellboreProperties = (wellbore: Wellbore): Map<string, string> => {
  return new Map([
    ["Well", wellbore.wellName],
    ["UID Well", wellbore.wellUid],
    ["Wellbore", wellbore.name],
    ["UID Wellbore", wellbore.uid]
  ]);
};
