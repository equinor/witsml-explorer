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
import ModificationType from "./modificationType";
import { Action } from "./navigationActions";

export interface AddServerAction extends Action {
  type: ModificationType.AddServer;
  payload: { server: Server };
}

export interface UpdateServerAction extends Action {
  type: ModificationType.UpdateServer;
  payload: { server: Server };
}

export interface AddWellAction extends Action {
  type: ModificationType.AddWell;
  payload: { well: Well };
}

export interface UpdateWellAction extends Action {
  type: ModificationType.UpdateWell;
  payload: { well: Well };
}

export interface UpdateWellsAction extends Action {
  type: ModificationType.UpdateWells;
  payload: { wells: Well[] };
}

export interface AddWellboreAction extends Action {
  type: ModificationType.AddWellbore;
  payload: { wellbore: Wellbore };
}

export interface UpdateWellboreAction extends Action {
  type: ModificationType.UpdateWellbore;
  payload: { wellbore: Wellbore };
}

export interface RemoveWellAction extends Action {
  type: ModificationType.RemoveWell;
  payload: { wellUid: string };
}

export interface RemoveWellboreAction extends Action {
  type: ModificationType.RemoveWellbore;
  payload: { wellUid: string; wellboreUid: string };
}

export interface RemoveWitsmlServerAction extends Action {
  type: ModificationType.RemoveServer;
  payload: { serverUid: string };
}

export interface UpdateWellboreBhaRunsAction extends Action {
  type: ModificationType.UpdateBhaRuns;
  payload: { bhaRuns: BhaRun[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreLogsAction extends Action {
  type: ModificationType.UpdateLogObjects;
  payload: { logs: LogObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreLogAction extends Action {
  type: ModificationType.UpdateLogObject;
  payload: { log: LogObject };
}

export interface UpdateWellboreMessagesAction extends Action {
  type: ModificationType.UpdateMessageObjects;
  payload: { messages: MessageObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreMessageAction extends Action {
  type: ModificationType.UpdateMessageObject;
  payload: { message: MessageObject };
}

export interface UpdateWellboreRigsAction extends Action {
  type: ModificationType.UpdateRigsOnWellbore;
  payload: { rigs: Rig[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreRisksAction extends Action {
  type: ModificationType.UpdateRiskObjects;
  payload: { risks: RiskObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreRiskAction extends Action {
  type: ModificationType.UpdateRisksOnWellbore;
  payload: { risks: RiskObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreTrajectoryAction extends Action {
  type: ModificationType.UpdateTrajectoryOnWellbore;
  payload: { trajectory: Trajectory; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreTrajectoriesAction extends Action {
  type: ModificationType.UpdateTrajectoriesOnWellbore;
  payload: { trajectories: Trajectory[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreTubularsAction extends Action {
  type: ModificationType.UpdateTubularsOnWellbore;
  payload: { tubulars: Tubular[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreTubularAction extends Action {
  type: ModificationType.UpdateTubularOnWellbore;
  payload: { tubular: Tubular; exists: boolean };
}

export interface UpdateWellboreWbGeometrysAction extends Action {
  type: ModificationType.UpdateWbGeometryObjects;
  payload: { wbGeometrys: WbGeometryObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreWbGeometryAction extends Action {
  type: ModificationType.UpdateWbGeometryOnWellbore;
  payload: { wbGeometry: WbGeometryObject; wellUid: string; wellboreUid: string };
}

export interface UpdateServerListAction extends Action {
  type: ModificationType.UpdateServerList;
  payload: { servers: Server[] };
}
