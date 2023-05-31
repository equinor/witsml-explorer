import BhaRun from "../models/bhaRun";
import ChangeLog from "../models/changeLog";
import FluidsReport from "../models/fluidsReport";
import FormationMarker from "../models/formationMarker";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import MudLog from "../models/mudLog";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import { Server } from "../models/server";
import Trajectory from "../models/trajectory";
import Tubular from "../models/tubular";
import WbGeometryObject from "../models/wbGeometry";
import Well from "../models/well";
import Wellbore from "../models/wellbore";
import CurveThreshold from "./curveThreshold";
import Filter from "./filter";
import NavigationType from "./navigationType";

export interface Action {
  type: any;
  payload: any;
}

export interface SelectServerAction extends Action {
  type: NavigationType.SelectServer;
  payload: { server: Server };
}

export interface ToggleTreeNodeAction extends Action {
  type: NavigationType.ToggleTreeNode;
  payload: { nodeId: string };
}

export interface SelectWellAction extends Action {
  type: NavigationType.SelectWell;
  payload: { well: Well; wellbores: Wellbore[] };
}

export interface SelectWellboreAction extends Action {
  type: NavigationType.SelectWellbore;
  payload: {
    well: Well;
    wellbore: Wellbore;
    bhaRuns: BhaRun[];
    changeLogs: ChangeLog[];
    fluidsReports: FluidsReport[];
    formationMarkers: FormationMarker[];
    logs: LogObject[];
    rigs: Rig[];
    trajectories: Trajectory[];
    messages: MessageObject[];
    mudLogs: MudLog[];
    risks: RiskObject[];
    tubulars: Tubular[];
    wbGeometries: WbGeometryObject[];
  };
}

export interface SelectJobsAction extends Action {
  type: NavigationType.SelectJobs;
}

export interface SelectObjectGroupAction extends Action {
  type: NavigationType.SelectObjectGroup;
  payload: { well: Well; wellbore: Wellbore; objectType: ObjectType };
}

export interface SelectLogTypeAction extends Action {
  type: NavigationType.SelectLogType;
  payload: { well: Well; wellbore: Wellbore; logTypeGroup: any };
}

export interface SelectLogCurveInfoAction extends Action {
  type: NavigationType.ShowCurveValues;
  payload: { logCurveInfo: any };
}

export interface SelectObjectAction extends Action {
  type: NavigationType.SelectObject;
  payload: { object: ObjectOnWellbore; well: Well; wellbore: Wellbore; objectType: ObjectType };
}

export interface SetFilterAction extends Action {
  type: NavigationType.SetFilter;
  payload: { filter: Filter };
}

export interface SetCurveThresholdAction extends Action {
  type: NavigationType.SetCurveThreshold;
  payload: { curveThreshold: CurveThreshold };
}

export interface SelectServerManagerAction extends Action {
  type: NavigationType.SelectServerManager;
}
