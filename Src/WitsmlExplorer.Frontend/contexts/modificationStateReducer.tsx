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
  UpdateWellboreObjectAction,
  UpdateWellboreObjectsAction,
  UpdateWellborePartialAction,
  UpdateWellsAction
} from "contexts/modificationActions";
import ModificationType from "contexts/modificationType";
import { Action } from "contexts/navigationActions";
import { NavigationState, allDeselected } from "contexts/navigationContext";
import {
  toggleTreeNode,
  treeNodeIsExpanded
} from "contexts/navigationStateReducer";
import BhaRun from "models/bhaRun";
import LogObject from "models/logObject";
import MessageObject from "models/messageObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import RiskObject from "models/riskObject";
import Trajectory from "models/trajectory";
import WbGeometryObject from "models/wbGeometry";
import Well from "models/well";
import Wellbore, {
  WellboreObjects,
  calculateWellboreNodeId,
  objectTypeToWellboreObjects
} from "models/wellbore";
import AuthorizationService from "services/authorizationService";

export const performModificationAction = (
  state: NavigationState,
  action: Action
) => {
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
    case ModificationType.UpdateWellborePartial:
      return updateWellborePartial(state, action);
    case ModificationType.UpdateWellboreObject:
      return updateWellboreObject(state, action);
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

const updateServer = (
  state: NavigationState,
  { payload }: UpdateServerAction
) => {
  const { server } = payload;
  const index = state.servers.findIndex((s) => s.id === server.id);
  state.servers.splice(index, 1, server);
  AuthorizationService.onServerStateChange(server);
  return {
    ...state,
    servers: [...state.servers],
    selectedServer:
      state.selectedServer?.id === server.id ? server : state.selectedServer,
    currentSelected:
      state.selectedServer && state.currentSelected === state.selectedServer
        ? server
        : state.currentSelected
  };
};

const addWell = (state: NavigationState, { payload }: AddWellAction) => {
  const { well } = payload;
  const wells = [...state.wells];
  wells.push(well);
  sortList(wells);

  return {
    ...state,
    wells
  };
};

const updateWell = (state: NavigationState, { payload }: UpdateWellAction) => {
  const { well, overrideWellbores } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, well.uid);
  const { wellbores: oldWellbores } = wells[wellIndex];
  const updatedWell = overrideWellbores
    ? { ...well }
    : { ...well, wellbores: oldWellbores };
  wells[wellIndex] = updatedWell;

  const refreshedWellIsSelected = state.selectedWell?.uid === well.uid;

  return {
    ...state,
    wells,
    selectedWell: refreshedWellIsSelected
      ? wells[wellIndex]
      : state.selectedWell
  };
};

const addWellbore = (
  state: NavigationState,
  { payload }: AddWellboreAction
) => {
  const { wellbore } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, wellbore.wellUid);

  wells[wellIndex].wellbores.push(wellbore);
  sortList(wells[wellIndex].wellbores);

  return {
    ...state,
    wells
  };
};

const updateWellbore = (
  state: NavigationState,
  { payload }: UpdateWellboreAction
) => {
  const { wellbore } = payload;
  const wells = [...state.wells];
  const wellIndex = getWellIndex(wells, wellbore.wellUid);
  const wellboreIndex = getWellboreIndex(wells, wellIndex, wellbore.uid);
  const refreshedWellboreIsSelected =
    state.selectedWellbore?.uid === wellbore.uid;
  wells[wellIndex].wellbores[wellboreIndex] = { ...wellbore };

  return {
    ...state,
    wells,
    selectedWellbore: refreshedWellboreIsSelected
      ? wells[wellIndex].wellbores[wellboreIndex]
      : state.selectedWellbore
  };
};

const updateWellborePartial = (
  state: NavigationState,
  { payload }: UpdateWellborePartialAction
) => {
  const { wellboreUid, wellUid, wellboreProperties } = payload;
  const wellIndex = state.wells.findIndex((w) => w.uid === wellUid);
  const well = state.wells[wellIndex];
  const wellboreIndex = well.wellbores.findIndex((w) => w.uid === wellboreUid);
  const wellbore = well.wellbores[wellboreIndex];
  const updatedWellbore: Wellbore = { ...wellboreProperties, ...wellbore };
  const updatedWell = { ...well };
  updatedWell.wellbores.splice(wellboreIndex, 1, updatedWellbore);
  const freshWells = [...state.wells];
  freshWells.splice(wellIndex, 1, updatedWell);

  const refreshedWellboreIsSelected =
    state.selectedWellbore?.uid === wellbore.uid;
  const refreshedWellIsSelected = state.selectedWell?.uid === wellbore.wellUid;
  return {
    ...state,
    wells: freshWells,
    selectedWellbore: refreshedWellboreIsSelected
      ? updatedWellbore
      : state.selectedWellbore,
    selectedWell: refreshedWellIsSelected ? updatedWell : state.selectedWellbore
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
    ...updatedSelectState
  };
};

const removeWellbore = (
  state: NavigationState,
  { payload }: RemoveWellboreAction
) => {
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
  const shouldCollapseWellbore = treeNodeIsExpanded(
    state.expandedTreeNodes,
    wellboreNodeId
  );
  return {
    ...state,
    wells,
    expandedTreeNodes: shouldCollapseWellbore
      ? toggleTreeNode(state.expandedTreeNodes, wellboreNodeId)
      : state.expandedTreeNodes,
    ...updatedSelectState
  };
};

const removeServer = (
  state: NavigationState,
  { payload }: RemoveWitsmlServerAction
) => {
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

const updateWellboreObjects = (
  state: NavigationState,
  { payload }: UpdateWellboreObjectsAction
) => {
  const { wells } = state;
  const { wellboreObjects, wellUid, wellboreUid, objectType } = payload;
  const objectsName = objectTypeToWellboreObjects(objectType);
  const namedObjects: Partial<
    Record<keyof WellboreObjects, ObjectOnWellbore[]>
  > = {};
  namedObjects[objectsName] = wellboreObjects;
  const freshWells = replacePropertiesInWellbore(
    wellUid,
    wells,
    wellboreUid,
    namedObjects
  );
  const { currentSelected, newSelectedObject } =
    getCurrentSelectedObjectIfRemoved(
      state,
      wellboreObjects,
      state.selectedObject,
      wellboreUid,
      wellUid,
      objectType
    );
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(
      state,
      freshWells,
      wellUid,
      wellboreUid
    ),
    selectedObject: newSelectedObject,
    currentSelected,
    wells: freshWells
  };
};

const updateWellboreObject = (
  state: NavigationState,
  { payload }: UpdateWellboreObjectAction
) => {
  const { wells } = state;
  const { objectToUpdate, objectType, isDeleted } = payload;
  const wellIndex = getWellIndex(wells, objectToUpdate.wellUid);
  const wellboreIndex = getWellboreIndex(
    wells,
    wellIndex,
    objectToUpdate.wellboreUid
  );
  const objectsName = objectTypeToWellboreObjects(objectType);
  const wellboreObjects = [
    ...wells[wellIndex].wellbores[wellboreIndex][objectsName]
  ];
  const existingObjectIndex = wellboreObjects.findIndex(
    (o) => o.uid === objectToUpdate.uid
  );

  let selectedObject = state.selectedObject;
  let currentSelected = state.currentSelected;
  const objectToUpdateIsSelected =
    sameUids(objectToUpdate, state.selectedObject) &&
    state.selectedObjectGroup == objectType;
  if (isDeleted) {
    if (existingObjectIndex != -1) {
      wellboreObjects.splice(existingObjectIndex, 1);
    }
    if (objectToUpdateIsSelected) {
      selectedObject = null;
      currentSelected = state.selectedLogTypeGroup ?? state.selectedObjectGroup;
    }
  } else if (existingObjectIndex == -1) {
    //insert objectToUpdate assuming alphabetical order
    const index = wellboreObjects.findIndex(
      (object) => objectToUpdate.name.localeCompare(object.name) < 1
    );
    wellboreObjects.splice(
      index == -1 ? wellboreObjects.length : index,
      0,
      objectToUpdate
    );
  } else {
    wellboreObjects[existingObjectIndex] = objectToUpdate;
    if (objectToUpdateIsSelected) {
      selectedObject = objectToUpdate;
      currentSelected =
        state.currentSelected == state.selectedObject
          ? objectToUpdate
          : state.currentSelected;
    }
  }

  const namedObjects: Partial<
    Record<keyof WellboreObjects, ObjectOnWellbore[]>
  > = {};
  namedObjects[objectsName] = wellboreObjects;
  const freshWells = replacePropertiesInWellbore(
    objectToUpdate.wellUid,
    wells,
    objectToUpdate.wellboreUid,
    namedObjects
  );
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(
      state,
      freshWells,
      objectToUpdate.wellUid,
      objectToUpdate.wellboreUid
    ),
    wells: freshWells,
    selectedObject,
    currentSelected
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
  const fetchedSelectedObject = objects.find(
    (value) => value.uid === selectedObject?.uid
  );
  const isCurrentlySelectedObjectRemoved =
    state.selectedWell?.uid == updatedWellUid &&
    state.selectedWellbore?.uid == updatedWellboreUid && // the update happened on the wellbore that is currently being browsed
    state.selectedObjectGroup == objectType &&
    selectedObject && // there exists a selected object of the same type as the object type that was updated
    !fetchedSelectedObject && // the selected object does not exist among the objects fetched from the server, implying deletion
    state.currentSelected == selectedObject; // the object that is currently selected was deleted, requiring update of currently selected object
  //navigate from the currently selected object to its object group if it was deleted
  const currentSelected = isCurrentlySelectedObjectRemoved
    ? state.selectedLogTypeGroup ?? state.selectedObjectGroup
    : state.currentSelected;
  return {
    currentSelected,
    //update the selected object if it was fetched
    newSelectedObject: isCurrentlySelectedObjectRemoved
      ? null
      : fetchedSelectedObject ?? selectedObject
  };
};

const getWellIndex = (wells: Well[], wellUid: string) => {
  return wells.findIndex((well) => well.uid === wellUid);
};

const getWellboreIndex = (
  wells: Well[],
  wellIndex: number,
  wellboreUid: string
) => {
  return wells[wellIndex].wellbores.findIndex(
    (wellbore) => wellbore.uid === wellboreUid
  );
};

const updateSelectedWellAndWellboreIfNeeded = (
  state: NavigationState,
  freshWells: Well[],
  wellUid: string,
  wellboreUid: string
) => {
  const wellIndex = getWellIndex(freshWells, wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, wellboreUid);
  const selectedWell =
    state.selectedWell?.uid == wellUid
      ? freshWells[wellIndex]
      : state.selectedWell;
  const selectedWellbore =
    state.selectedWellbore?.uid == wellboreUid
      ? freshWells[wellIndex].wellbores[wellboreIndex]
      : state.selectedWellbore;
  return {
    selectedWell,
    selectedWellbore
  };
};

const replacePropertiesInWellbore = (
  wellUid: string,
  wells: Well[],
  wellboreUid: string,
  wellboreProperties: Record<
    string,
    | BhaRun[]
    | LogObject[]
    | Trajectory[]
    | MessageObject[]
    | RiskObject[]
    | Rig[]
    | WbGeometryObject[]
  >
): Well[] => {
  const wellIndex = getWellIndex(wells, wellUid);
  const wellboreIndex = getWellboreIndex(wells, wellIndex, wellboreUid);
  const well = { ...wells[wellIndex] };
  const wellbore = { ...well.wellbores[wellboreIndex], ...wellboreProperties };
  well.wellbores.splice(wellboreIndex, 1, wellbore);
  wells.splice(wellIndex, 1, well);
  return [...wells];
};

const updateServerList = (
  state: NavigationState,
  { payload }: UpdateServerListAction
) => {
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

const updateWells = (
  state: NavigationState,
  { payload }: UpdateWellsAction
) => {
  const { wells } = payload;
  return {
    ...state,
    wells: wells
  };
};

const sameUids = (object1: ObjectOnWellbore, object2: ObjectOnWellbore) => {
  if (object1 == null || object2 == null) {
    return false;
  }
  return (
    object1.uid === object2.uid &&
    object1.wellboreUid === object2.wellboreUid &&
    object1.wellUid === object2.wellUid
  );
};
