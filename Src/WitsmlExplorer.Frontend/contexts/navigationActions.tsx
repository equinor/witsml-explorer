import BhaRun from "../models/bhaRun";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
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
    logs: LogObject[];
    rigs: Rig[];
    trajectories: Trajectory[];
    messages: MessageObject[];
    risks: RiskObject[];
    tubulars: Tubular[];
    wbGeometrys: WbGeometryObject[];
  };
}

export interface SelectJobsAction extends Action {
  type: NavigationType.SelectJobs;
}

export interface SelectBhaRunGroupAction extends Action {
  type: NavigationType.SelectBhaRunGroup;
  payload: { well: Well; wellbore: Wellbore; bhaRunGroup: any };
}

export interface SelectLogGroupAction extends Action {
  type: NavigationType.SelectLogGroup;
  payload: { well: Well; wellbore: Wellbore; logGroup: any };
}

export interface SelectLogTypeAction extends Action {
  type: NavigationType.SelectLogType;
  payload: { well: Well; wellbore: Wellbore; logGroup: string; logTypeGroup: any };
}

export interface SelectLogObjectAction extends Action {
  type: NavigationType.SelectLogObject;
  payload: { log: LogObject; well: Well; wellbore: Wellbore };
}

export interface SelectMessageGroupAction extends Action {
  type: NavigationType.SelectMessageGroup;
  payload: { well: Well; wellbore: Wellbore; messageGroup: any };
}

export interface SelectRiskGroupAction extends Action {
  type: NavigationType.SelectRiskGroup;
  payload: { well: Well; wellbore: Wellbore; riskGroup: any };
}

export interface SelectLogCurveInfoAction extends Action {
  type: NavigationType.ShowCurveValues;
  payload: { logCurveInfo: any };
}

export interface SelectRigGroupAction extends Action {
  type: NavigationType.SelectRigGroup;
  payload: { well: Well; wellbore: Wellbore; rigGroup: any };
}

export interface SelectTrajectoryGroupAction extends Action {
  type: NavigationType.SelectTrajectoryGroup;
  payload: { well: Well; wellbore: Wellbore; trajectoryGroup: any };
}

export interface SelectTrajectoryAction extends Action {
  type: NavigationType.SelectTrajectory;
  payload: { well: Well; wellbore: Wellbore; trajectory: Trajectory; trajectoryGroup: any };
}

export interface SelectTubularGroupAction extends Action {
  type: NavigationType.SelectTubularGroup;
  payload: { well: Well; wellbore: Wellbore; tubularGroup: any };
}

export interface SelectTubularAction extends Action {
  type: NavigationType.SelectTubular;
  payload: { well: Well; wellbore: Wellbore; tubular: Tubular; tubularGroup: any };
}

export interface SelectWbGeometryGroupAction extends Action {
  type: NavigationType.SelectWbGeometryGroup;
  payload: { well: Well; wellbore: Wellbore; wbGeometryGroup: any };
}

export interface SelectWbGeometryAction extends Action {
  type: NavigationType.SelectWbGeometry;
  payload: { well: Well; wellbore: Wellbore; wbGeometry: WbGeometryObject; wbGeometryGroup: any };
}

export interface SetFilterAction extends Action {
  type: NavigationType.SetFilter;
  payload: { filter: Filter };
}

export interface SetCurveThresholdAction extends Action {
  type: NavigationType.SetCurveThreshold;
  payload: { curveThreshold: CurveThreshold };
}

export interface SelectManageServerAction extends Action {
  type: NavigationType.SelectManageServer;
}