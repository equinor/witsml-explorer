import BhaRun from "../models/bhaRun";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import Trajectory from "../models/trajectory";
import WbGeometryObject from "../models/wbGeometry";
import Well from "../models/well";
import Wellbore, { WellboreObjects, calculateWellboreNodeId, objectTypeToWellboreObjects } from "../models/wellbore";
import AuthorizationService from "../services/authorizationService";
import { filterWells } from "./filter";
import {
  AddServerAction,
  AddWellAction,
  AddWellboreAction,
  RemoveWellAction,
  RemoveWellboreAction,
  RemoveWitsmlServerAction,
  UpdateServerAction,
  UpdateServerListAction,
  UpdateWellAction,
  UpdateWellboreAction,
  UpdateWellboreLogAction,
  UpdateWellboreObjectsAction,
  UpdateWellboreTrajectoryAction,
  UpdateWellboreTubularAction,
  UpdateWellboreWbGeometryAction,
  UpdateWellsAction
} from "./modificationActions";
import ModificationType from "./modificationType";
import { Action } from "./navigationActions";
import { NavigationState, allDeselected } from "./navigationContext";
import { toggleTreeNode, treeNodeIsExpanded } from "./navigationStateReducer";

export const performModificationAction = (state: NavigationState, action: Action) => {
  switch (action.type) {
    case ModificationType.AddWell:
      return addWell(state, action);
    case ModificationType.AddServer:
      return addServer(state, action);
    case ModificationType.UpdateServer:
      return updateServer(state, action);
    case ModificationType.RemoveWell:
      return removeWell(state, action);
    case ModificationType.RemoveWellbore:
      return removeWellbore(state, action);
    case ModificationType.RemoveServer:
      return removeServer(state, action);
    case ModificationType.UpdateWell:
      return updateWell(state, action);
    case ModificationType.AddWellbore:
      return addWellbore(state, action);
    case ModificationType.UpdateWellbore:
      return updateWellbore(state, action);
    case ModificationType.UpdateLogObject:
      return updateWellboreLog(state, action);
    case ModificationType.UpdateTrajectoryOnWellbore:
      return updateWellboreTrajectory(state, action);
    case ModificationType.UpdateTubularOnWellbore:
      return updateWellboreTubular(state, action);
    case ModificationType.UpdateWbGeometryOnWellbore:
      return updateWellboreWbGeometry(state, action);
    case ModificationType.UpdateWellboreObjects:
      return updateWellboreObjects(state, action);
    case ModificationType.UpdateServerList:
      return updateServerList(state, action);
    case ModificationType.UpdateWells:
      return updateWells(state, action);
    default:
      throw new Error();
  }
};

export const sortList = (list: Well[] | Wellbore[]): void => {
  list.sort((a: Well | Wellbore, b: Well | Wellbore) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
};

const addServer = (state: NavigationState, { payload }: AddServerAction) => {
  const { server } = payload;
  return {
    ...state,
    servers: state.servers.concat([server])
  };
};

const updateServer = (state: NavigationState, { payload }: UpdateServerAction) => {
  const { server } = payload;
  const index = state.servers.findIndex((s) => s.id === server.id);
  state.servers.splice(index, 1, server);
  AuthorizationService.onServerStateChange(server);
  return {
    ...state,
    servers: [...state.servers],
    selectedServer: state.selectedServer?.id === server.id ? server : state.selectedServer,
    currentSelected: state.selectedServer && state.currentSelected === state.selectedServer ? server : state.currentSelected
  };
};

const addWell = (state: NavigationState, { payload }: AddWellAction) => {
  const { well } = payload;
  const wells = [...state.wells];
  wells.push(well);
  sortList(wells);

  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter)
  };
};

const updateWell = (state: NavigationState, { payload }: UpdateWellAction) => {
  const { well } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, well.uid);
  const { wellbores } = wells[wellIndex];

  wells[wellIndex] = { ...well, wellbores };
  const refreshedWellIsSelected = state.selectedWell?.uid === well.uid;

  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter),
    selectedWell: refreshedWellIsSelected ? wells[wellIndex] : state.selectedWell
  };
};

const addWellbore = (state: NavigationState, { payload }: AddWellboreAction) => {
  const { wellbore } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, wellbore.wellUid);

  wells[wellIndex].wellbores.push(wellbore);
  sortList(wells[wellIndex].wellbores);

  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter)
  };
};

const updateWellbore = (state: NavigationState, { payload }: UpdateWellboreAction) => {
  const { wellbore } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, wellbore.wellUid);
  const wellboreIndex = getWellboreIndex(wells, wellIndex, wellbore.uid);
  const refreshedWellboreIsSelected = state.selectedWellbore?.uid === wellbore.uid;
  wells[wellIndex].wellbores[wellboreIndex] = { ...wellbore };

  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter),
    selectedWellbore: refreshedWellboreIsSelected ? wells[wellIndex].wellbores[wellboreIndex] : state.selectedWellbore
  };
};

const removeWell = (state: NavigationState, { payload }: RemoveWellAction) => {
  const { wellUid } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, wellUid);
  wells.splice(wellIndex, 1);

  const selectedIsRemoved = state.selectedWell?.uid === wellUid;
  const updatedSelectState = selectedIsRemoved
    ? {
        ...allDeselected,
        selectedServer: state.selectedServer
      }
    : {};
  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter),
    ...updatedSelectState
  };
};

const removeWellbore = (state: NavigationState, { payload }: RemoveWellboreAction) => {
  const { wellUid, wellboreUid } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, wellUid);
  const wellboreIndex = getWellboreIndex(wells, wellIndex, wellboreUid);
  wells[wellIndex].wellbores.splice(wellboreIndex, 1);
  sortList(wells[wellIndex].wellbores);

  const selectedIsRemoved = state.selectedWellbore?.uid === wellboreUid;
  const updatedSelectState = selectedIsRemoved
    ? {
        ...allDeselected,
        selectedServer: state.selectedServer,
        selectedWell: state.selectedWell
      }
    : {};

  const wellboreNodeId = calculateWellboreNodeId({ wellUid, uid: wellboreUid });
  const shouldCollapseWellbore = treeNodeIsExpanded(state.expandedTreeNodes, wellboreNodeId);
  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter),
    expandedTreeNodes: shouldCollapseWellbore ? toggleTreeNode(state.expandedTreeNodes, wellboreNodeId) : state.expandedTreeNodes,
    ...updatedSelectState
  };
};

const removeServer = (state: NavigationState, { payload }: RemoveWitsmlServerAction) => {
  const { servers, selectedServer } = state;
  const { serverUid } = payload;

  const index = servers.findIndex((server) => server.id === serverUid);
  if (index !== -1) {
    servers.splice(index, 1);
  }

  const selectedIsRemoved = selectedServer?.id === serverUid;
  const updatedSelectState = selectedIsRemoved ? { ...allDeselected } : {};

  return {
    ...state,
    ...updatedSelectState,
    servers
  };
};

const updateWellboreLog = (state: NavigationState, { payload }: UpdateWellboreLogAction) => {
  const { wells } = state;
  const { log } = payload;
  const updatedWells = insertLogIntoWellsStructure(wells, log);
  const selectedObject = sameUids(log, state.selectedObject) && state.selectedObjectGroup == ObjectType.Log ? log : state.selectedObject;
  return {
    ...state,
    wells: updatedWells,
    filteredWells: filterWells(updatedWells, state.selectedFilter),
    selectedObject
  };
};

const insertLogIntoWellsStructure = (wells: Well[], log: LogObject): Well[] => {
  const freshWells = [...wells];
  const wellIndex = getWellIndex(freshWells, log.wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, log.wellboreUid);
  const logIndex = getLogIndex(freshWells, wellIndex, wellboreIndex, log.uid);
  freshWells[wellIndex].wellbores[wellboreIndex].logs[logIndex] = log;

  return freshWells;
};

const updateWellboreTrajectory = (state: NavigationState, { payload }: UpdateWellboreTrajectoryAction) => {
  const { wells } = state;
  const { trajectory, wellUid, wellboreUid } = payload;
  const freshWells = [...wells];
  const wellIndex = getWellIndex(freshWells, wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, wellboreUid);
  const freshTrajectories = [...wells[wellIndex].wellbores[wellboreIndex].trajectories];
  const trajectoryIndex = freshTrajectories.findIndex((t) => t.uid === trajectory.uid);
  let selectedObject = null;
  freshTrajectories[trajectoryIndex] = trajectory;
  selectedObject = sameUids(trajectory, state.selectedObject) && state.selectedObjectGroup == ObjectType.Trajectory ? trajectory : state.selectedObject;
  wells[wellIndex].wellbores[wellboreIndex].trajectories = freshTrajectories;
  return {
    ...state,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter),
    selectedObject
  };
};

const updateWellboreTubular = (state: NavigationState, { payload }: UpdateWellboreTubularAction) => {
  const { wells } = state;
  const { tubular, exists } = payload;
  const freshWells = [...wells];
  const wellIndex = getWellIndex(freshWells, tubular.wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, tubular.wellboreUid);
  const freshTubulars = [...wells[wellIndex].wellbores[wellboreIndex].tubulars];
  const tubularIndex = freshTubulars.findIndex((t) => t.uid === tubular.uid);
  let selectedObject = null;
  if (exists) {
    freshTubulars[tubularIndex] = tubular;
    selectedObject = sameUids(tubular, state.selectedObject) && state.selectedObjectGroup == ObjectType.Tubular ? tubular : state.selectedObject;
  } else {
    freshTubulars.splice(tubularIndex, 1);
  }
  wells[wellIndex].wellbores[wellboreIndex].tubulars = freshTubulars;

  return {
    ...state,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter),
    selectedObject
  };
};

const updateWellboreWbGeometry = (state: NavigationState, { payload }: UpdateWellboreWbGeometryAction) => {
  const { wells } = state;
  const { wbGeometry, wellUid, wellboreUid } = payload;
  const freshWells = [...wells];
  const wellIndex = getWellIndex(freshWells, wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, wellboreUid);
  const freshWbGeometries = [...wells[wellIndex].wellbores[wellboreIndex].wbGeometries];
  const wbGeometryIndex = freshWbGeometries.findIndex((wbg) => wbg.uid === wbGeometry.uid);
  let selectedObject = null;
  freshWbGeometries[wbGeometryIndex] = wbGeometry;
  selectedObject = sameUids(wbGeometry, state.selectedObject) && state.selectedObjectGroup == ObjectType.WbGeometry ? wbGeometry : state.selectedObject;
  wells[wellIndex].wellbores[wellboreIndex].wbGeometries = freshWbGeometries;
  return {
    ...state,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter),
    selectedObject: selectedObject
  };
};

const updateWellboreObjects = (state: NavigationState, { payload }: UpdateWellboreObjectsAction) => {
  const { wells } = state;
  const { wellboreObjects, wellUid, wellboreUid, objectType } = payload;
  const objectsName = objectTypeToWellboreObjects(objectType);
  const namedObjects: Partial<Record<keyof WellboreObjects, ObjectOnWellbore[]>> = {};
  namedObjects[objectsName] = wellboreObjects;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, namedObjects);
  const { currentSelected, newSelectedObject } = getCurrentSelectedObjectIfRemoved(state, wellboreObjects, state.selectedObject, wellboreUid, wellUid, objectType);
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    selectedObject: newSelectedObject,
    currentSelected,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter)
  };
};

//update the current selected object if the current selected object was deleted
const getCurrentSelectedObjectIfRemoved = (
  state: NavigationState,
  objects: ObjectOnWellbore[],
  selectedObject: ObjectOnWellbore,
  updatedWellboreUid: string,
  updatedWellUid: string,
  objectType: ObjectType
) => {
  const fetchedSelectedObject = objects.find((value) => value.uid === selectedObject?.uid);
  const isCurrentlySelectedObjectRemoved =
    state.selectedWell?.uid == updatedWellUid &&
    state.selectedWellbore?.uid == updatedWellboreUid && // the update happened on the wellbore that is currently being browsed
    state.selectedObjectGroup == objectType &&
    selectedObject && // there exists a selected object of the same type as the object type that was updated
    !fetchedSelectedObject && // the selected object does not exist among the objects fetched from the server, implying deletion
    state.currentSelected == selectedObject; // the object that is currently selected was deleted, requiring update of currently selected object
  //navigate from the currently selected object to its object group if it was deleted
  const currentSelected = isCurrentlySelectedObjectRemoved ? state.selectedObjectGroup : state.currentSelected;
  return {
    currentSelected,
    //update the selected object if it was fetched
    newSelectedObject: isCurrentlySelectedObjectRemoved ? null : fetchedSelectedObject ?? selectedObject
  };
};

const getWellIndex = (wells: Well[], wellUid: string) => {
  return wells.findIndex((well) => well.uid === wellUid);
};

const getWellboreIndex = (wells: Well[], wellIndex: number, wellboreUid: string) => {
  return wells[wellIndex].wellbores.findIndex((wellbore) => wellbore.uid === wellboreUid);
};

const getLogIndex = (wells: Well[], wellIndex: number, wellboreIndex: number, logUid: string) => {
  return wells[wellIndex].wellbores[wellboreIndex].logs.findIndex((log) => log.uid === logUid);
};

const updateSelectedWellAndWellboreIfNeeded = (state: NavigationState, freshWells: Well[], wellUid: string, wellboreUid: string) => {
  const wellIndex = getWellIndex(freshWells, wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, wellboreUid);
  const selectedWell = state.selectedWell?.uid == wellUid ? freshWells[wellIndex] : state.selectedWell;
  const selectedWellbore = state.selectedWellbore?.uid == wellboreUid ? freshWells[wellIndex].wellbores[wellboreIndex] : state.selectedWellbore;
  return {
    selectedWell,
    selectedWellbore
  };
};

const replacePropertiesInWellbore = (
  wellUid: string,
  wells: Well[],
  wellboreUid: string,
  wellboreProperties: Record<string, BhaRun[] | LogObject[] | Trajectory[] | MessageObject[] | RiskObject[] | Rig[] | WbGeometryObject[]>
): Well[] => {
  const wellIndex = getWellIndex(wells, wellUid);
  const wellboreIndex = getWellboreIndex(wells, wellIndex, wellboreUid);
  const well = wells[wellIndex];
  const wellbore = { ...well.wellbores[wellboreIndex], ...wellboreProperties };
  well.wellbores.splice(wellboreIndex, 1, wellbore);
  wells.splice(wellIndex, 1, well);
  return [...wells];
};

const updateServerList = (state: NavigationState, { payload }: UpdateServerListAction) => {
  if (state.servers) {
    payload.servers.forEach((server) => {
      const existingServer = state.servers.find((s) => s.id == server.id);
      if (existingServer != null) {
        server.currentUsername = existingServer.currentUsername;
        AuthorizationService.onServerStateChange(server);
      }
    });
  }
  return {
    ...state,
    servers: payload.servers
  };
};

const updateWells = (state: NavigationState, { payload }: UpdateWellsAction) => {
  const { wells } = payload;
  return {
    ...state,
    wells: wells,
    filteredWells: filterWells(wells, state.selectedFilter)
  };
};

const sameUids = (object1: ObjectOnWellbore, object2: ObjectOnWellbore) => {
  return object1.uid === object2.uid && object1.wellboreUid === object2.wellboreUid && object1.wellUid === object2.wellUid;
};
