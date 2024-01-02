import ModificationType from "contexts/modificationType";
import { Action } from "contexts/navigationActions";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";

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
  payload: { well: Well; overrideWellbores?: boolean };
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

export interface UpdateWellborePartialAction extends Action {
  type: ModificationType.UpdateWellborePartial;
  payload: {
    wellUid: string;
    wellboreUid: string;
    wellboreProperties: Partial<Wellbore>;
  };
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

export interface UpdateWellboreObjectsAction extends Action {
  type: ModificationType.UpdateWellboreObjects;
  payload: {
    wellboreObjects: ObjectOnWellbore[];
    wellUid: string;
    wellboreUid: string;
    objectType: ObjectType;
  };
}

export interface UpdateWellboreObjectAction extends Action {
  type: ModificationType.UpdateWellboreObject;
  payload: {
    objectToUpdate: ObjectOnWellbore;
    objectType: ObjectType;
    isDeleted: boolean;
  };
}

export interface UpdateServerListAction extends Action {
  type: ModificationType.UpdateServerList;
  payload: { servers: Server[] };
}
