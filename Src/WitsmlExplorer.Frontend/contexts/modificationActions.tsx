import LogObject from "../models/logObject";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
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

export interface UpdateWellboreLogAction extends Action {
  type: ModificationType.UpdateLogObject;
  payload: { log: LogObject };
}

export interface UpdateWellboreTrajectoryAction extends Action {
  type: ModificationType.UpdateTrajectoryOnWellbore;
  payload: { trajectory: Trajectory; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreTubularAction extends Action {
  type: ModificationType.UpdateTubularOnWellbore;
  payload: { tubular: Tubular; exists: boolean };
}

export interface UpdateWellboreWbGeometryAction extends Action {
  type: ModificationType.UpdateWbGeometryOnWellbore;
  payload: { wbGeometry: WbGeometryObject; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreObjectsAction extends Action {
  type: ModificationType.UpdateWellboreObjects;
  payload: { wellboreObjects: ObjectOnWellbore[]; wellUid: string; wellboreUid: string; objectType: ObjectType };
}

export interface UpdateServerListAction extends Action {
  type: ModificationType.UpdateServerList;
  payload: { servers: Server[] };
}
