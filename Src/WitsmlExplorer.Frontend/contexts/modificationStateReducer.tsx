import BhaRun from "../models/bhaRun";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import ObjectOnWellbore from "../models/objectOnWellbore";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import Trajectory from "../models/trajectory";
import WbGeometryObject from "../models/wbGeometry";
import Well from "../models/well";
import Wellbore, { calculateLogTypeId, calculateTrajectoryGroupId, calculateTubularGroupId } from "../models/wellbore";
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
  UpdateWellboreBhaRunsAction,
  UpdateWellboreLogAction,
  UpdateWellboreLogsAction,
  UpdateWellboreMessageAction,
  UpdateWellboreMessagesAction,
  UpdateWellboreRigsAction,
  UpdateWellboreRisksAction,
  UpdateWellboreTrajectoriesAction,
  UpdateWellboreTrajectoryAction,
  UpdateWellboreTubularAction,
  UpdateWellboreTubularsAction,
  UpdateWellboreWbGeometryAction,
  UpdateWellboreWbGeometrysAction,
  UpdateWellsAction
} from "./modificationActions";
import ModificationType from "./modificationType";
import { Action } from "./navigationActions";
import { allDeselected, NavigationState } from "./navigationContext";
import { listWellsFlag } from "./navigationStateReducer";

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
    case ModificationType.UpdateBhaRuns:
      return updateWellboreBhaRuns(state, action);
    case ModificationType.UpdateLogObjects:
      return updateWellboreLogs(state, action);
    case ModificationType.UpdateLogObject:
      return updateWellboreLog(state, action);
    case ModificationType.UpdateMessageObjects:
      return updateWellboreMessages(state, action);
    case ModificationType.UpdateMessageObject:
      return updateWellboreMessage(state, action);
    case ModificationType.UpdateRigsOnWellbore:
      return updateWellboreRigs(state, action);
    case ModificationType.UpdateRiskObjects:
      return updateWellboreRisks(state, action);
    case ModificationType.UpdateTrajectoryOnWellbore:
      return updateWellboreTrajectory(state, action);
    case ModificationType.UpdateTrajectoriesOnWellbore:
      return updateWellboreTrajectories(state, action);
    case ModificationType.UpdateTubularOnWellbore:
      return updateWellboreTubular(state, action);
    case ModificationType.UpdateTubularsOnWellbore:
      return updateWellboreTubulars(state, action);
    case ModificationType.UpdateWbGeometryOnWellbore:
      return updateWellboreWbGeometry(state, action);
    case ModificationType.UpdateWbGeometryObjects:
      return updateWellboreWbGeometrys(state, action);
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
    servers: state.servers.concat([server]),
    currentSelected: state.selectedServer == null ? listWellsFlag : state.currentSelected,
    selectedServer: state.selectedServer

  };
};

const updateServer = (state: NavigationState, { payload }: UpdateServerAction) => {
  const { server } = payload;
  const index = state.servers.findIndex((s) => s.id === server.id);
  state.servers.splice(index, 1, server);
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
  return {
    ...state,
    wells,
    filteredWells: filterWells(wells, state.selectedFilter),
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

const updateWellboreBhaRuns = (state: NavigationState, { payload }: UpdateWellboreBhaRunsAction) => {
  const { wells } = state;
  const { bhaRuns, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { bhaRuns });
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells
  };
};

const updateWellboreMessages = (state: NavigationState, { payload }: UpdateWellboreMessagesAction) => {
  const { wells } = state;
  const { messages, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { messages });
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells
  };
};

const updateWellboreMessage = (state: NavigationState, { payload }: UpdateWellboreMessageAction) => {
  const { wells } = state;
  const { message } = payload;
  const updatedWells = insertLogIntoWellsStructure(wells, message);
  return {
    ...state,
    wells: updatedWells,
    filteredWells: filterWells(updatedWells, state.selectedFilter)
  };
};

const updateWellboreRigs = (state: NavigationState, { payload }: UpdateWellboreRigsAction) => {
  const { wells } = state;
  const { rigs, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { rigs });
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells
  };
};

const updateWellboreRisks = (state: NavigationState, { payload }: UpdateWellboreRisksAction) => {
  const { wells } = state;
  const { risks, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { risks });
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells
  };
};

const updateWellboreLogs = (state: NavigationState, { payload }: UpdateWellboreLogsAction) => {
  const { wells } = state;
  const { logs, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { logs });
  const calculateGroup = (wellbore: Wellbore) => calculateLogTypeId(wellbore, state.selectedLog.indexType);
  const { currentSelected, newSelectedObject } = getCurrentSelectedObjectIfRemoved(state, calculateGroup, logs, state.selectedLog, wellboreUid, wellUid);
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells,
    currentSelected,
    selectedLog: newSelectedObject
  };
};

const updateWellboreLog = (state: NavigationState, { payload }: UpdateWellboreLogAction) => {
  const { wells } = state;
  const { log } = payload;
  const updatedWells = insertLogIntoWellsStructure(wells, log);
  const selectedLog = state.selectedLog?.uid === log.uid ? log : state.selectedLog;

  return {
    ...state,
    wells: updatedWells,
    filteredWells: filterWells(updatedWells, state.selectedFilter),
    selectedLog
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
  let selectedTrajectory = null;
  freshTrajectories[trajectoryIndex] = trajectory;
  selectedTrajectory = state.selectedTrajectory?.uid === trajectory.uid ? trajectory : state.selectedTrajectory;
  wells[wellIndex].wellbores[wellboreIndex].trajectories = freshTrajectories;
  return {
    ...state,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter),
    selectedTrajectory
  };
};

const updateWellboreTrajectories = (state: NavigationState, { payload }: UpdateWellboreTrajectoriesAction) => {
  const { wells } = state;
  const { trajectories, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { trajectories });
  const { currentSelected, newSelectedObject } = getCurrentSelectedObjectIfRemoved(state, calculateTrajectoryGroupId, trajectories, state.selectedTrajectory, wellboreUid, wellUid);
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    selectedTrajectory: newSelectedObject,
    currentSelected,
    wells: freshWells
  };
};

const updateWellboreTubulars = (state: NavigationState, { payload }: UpdateWellboreTubularsAction) => {
  const { wells } = state;
  const { tubulars, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { tubulars });
  const { currentSelected, newSelectedObject } = getCurrentSelectedObjectIfRemoved(state, calculateTubularGroupId, tubulars, state.selectedTubular, wellboreUid, wellUid);
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    selectedTubular: newSelectedObject,
    currentSelected,
    wells: freshWells
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
  let selectedTubular = null;
  if (exists) {
    freshTubulars[tubularIndex] = tubular;
    selectedTubular = state.selectedTubular?.uid === tubular.uid ? tubular : state.selectedTubular;
  } else {
    freshTubulars.splice(tubularIndex, 1);
  }
  wells[wellIndex].wellbores[wellboreIndex].tubulars = freshTubulars;

  return {
    ...state,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter),
    selectedTubular
  };
};

const updateWellboreWbGeometrys = (state: NavigationState, { payload }: UpdateWellboreWbGeometrysAction) => {
  const { wells } = state;
  const { wbGeometrys, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { wbGeometrys });
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells
  };
};

const updateWellboreWbGeometry = (state: NavigationState, { payload }: UpdateWellboreWbGeometryAction) => {
  const { wells } = state;
  const { wbGeometry, wellUid, wellboreUid } = payload;
  const freshWells = [...wells];
  const wellIndex = getWellIndex(freshWells, wellUid);
  const wellboreIndex = getWellboreIndex(freshWells, wellIndex, wellboreUid);
  const freshWbGeometries = [...wells[wellIndex].wellbores[wellboreIndex].wbGeometrys];
  const wbGeometryIndex = freshWbGeometries.findIndex((wbg) => wbg.uid === wbGeometry.uid);
  let selectedWbGeometry = null;
  freshWbGeometries[wbGeometryIndex] = wbGeometry;
  selectedWbGeometry = state.selectedWbGeometry?.uid === wbGeometry.uid ? wbGeometry : state.selectedWbGeometry;
  wells[wellIndex].wellbores[wellboreIndex].wbGeometrys = freshWbGeometries;
  return {
    ...state,
    wells: freshWells,
    filteredWells: filterWells(freshWells, state.selectedFilter),
    selectedWbGeometry: selectedWbGeometry
  };
};

//update the current selected object if the current selected object was deleted
const getCurrentSelectedObjectIfRemoved = (
  state: NavigationState,
  calculateGroupId: (wellbore: Wellbore) => string,
  objects: ObjectOnWellbore[],
  selectedObject: ObjectOnWellbore,
  updatedWellboreUid: string,
  updatedWellUid: string
) => {
  const fetchedSelectedObject = objects.find((value) => value.uid === selectedObject?.uid);
  const isCurrentlySelectedObjectRemoved =
    state.selectedWell?.uid == updatedWellUid &&
    state.selectedWellbore?.uid == updatedWellboreUid && // the update happened on the wellbore that is currently being browsed
    selectedObject && // there exists a selected object of the same type as the object type that was updated
    !fetchedSelectedObject && // the selected object does not exist among the objects fetched from the server, implying deletion
    state.currentSelected == selectedObject; // the object that is currently selected was deleted, requiring update of currently selected object
  //navigate from the currently selected object to its object group if it was deleted
  const currentSelected = isCurrentlySelectedObjectRemoved ? calculateGroupId(state.selectedWellbore) : state.currentSelected;
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
  return {
    ...state,
    servers: payload.servers
  };
};

const updateWells = (state: NavigationState, { payload }: UpdateWellsAction) => {
  const { wells } = payload;
  return {
    ...state,
    currentSelected: listWellsFlag,
    wells: wells,
    filteredWells: filterWells(wells, state.selectedFilter)
  };
};
