import Rig from "./rig";
import LogObject from "./logObject";
import Trajectory from "./trajectory";
import { WITSML_INDEX_TYPE_DATE_TIME, WITSML_INDEX_TYPE_MD } from "../components/Constants";

export default interface Wellbore {
  uid: string;
  name: string;
  wellUid: string;
  wellName?: string;
  wellStatus: string;
  wellType: string;
  isActive: string;
  wellboreParentUid?: string;
  wellboreParentName?: string;
  wellborePurpose?: string;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
  itemState?: string;
  logs?: LogObject[];
  rigs?: Rig[];
  trajectories?: Trajectory[];
}

export function emptyWellbore(): Wellbore {
  return {
    uid: "",
    name: "",
    wellUid: "",
    wellName: "",
    wellStatus: "",
    wellType: "",
    isActive: "",
    wellboreParentUid: "",
    wellboreParentName: "",
    wellborePurpose: "unknown",
    dateTimeCreation: null,
    dateTimeLastChange: null,
    itemState: "",
    logs: [],
    rigs: [],
    trajectories: []
  };
}

export const calculateWellboreNodeId = (wellbore: Wellbore): string => {
  return wellbore.wellUid + wellbore.uid;
};

export const calculateRigGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "rigs";
};

export const calculateLogGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "logs";
};

export const calculateTrajectoryGroupId = (wellbore: Wellbore): string => {
  return calculateWellboreNodeId(wellbore) + "trajectories";
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
