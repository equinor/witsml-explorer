import { Dispatch, useReducer } from "react";
import LogObject, { getLogObjectProperties } from "../models/logObject";
import MessageObject, { getMessageObjectProperties } from "../models/messageObject";
import RiskObject from "../models/riskObject";
import Rig from "../models/rig";
import NavigationType from "./navigationType";
import Trajectory, { getTrajectoryProperties } from "../models/trajectory";
import Well, { getWellProperties } from "../models/well";
import Wellbore, {
  calculateBhaRunGroupId,
  calculateLogGroupId,
  calculateLogTypeId,
  calculateRigGroupId,
  calculateTrajectoryGroupId,
  calculateMessageGroupId,
  calculateRiskGroupId,
  calculateWellboreNodeId,
  getWellboreProperties,
  calculateTubularGroupId,
  calculateWbGeometryGroupId
} from "../models/wellbore";
import { Server } from "../models/server";
import ModificationType from "./modificationType";
import { LogCurveInfoRow } from "../components/ContentViews/LogCurveInfoListView";
import Filter, { EMPTY_FILTER, filterWells } from "./filter";
import CurveThreshold, { DEFAULT_CURVE_THRESHOLD } from "./curveThreshold";
import Tubular, { getTubularProperties } from "../models/tubular";
import WbGeometryObject from "../models/wbGeometry";
import BhaRun from "../models/bhaRun";

export interface NavigationState {
  selectedServer: Server;
  selectedWell: Well;
  selectedWellbore: Wellbore;
  selectedBhaRunGroup: string;
  selectedLogGroup: string;
  selectedLogTypeGroup: string;
  selectedLog: LogObject;
  selectedMessageGroup: string;
  selectedMessage: MessageObject;
  selectedRig: Rig;
  selectedRigGroup: string;
  selectedRisk: RiskObject;
  selectedRiskGroup: string;
  selectedLogCurveInfo: LogCurveInfoRow[];
  selectedTrajectoryGroup: string;
  selectedTrajectory: Trajectory;
  selectedTubularGroup: string;
  selectedTubular: Tubular;
  selectedWbGeometryGroup: string;
  selectedWbGeometry: WbGeometryObject;
  servers: Server[];
  currentSelected: Selectable;
  wells: Well[];
  filteredWells: Well[];
  selectedFilter: Filter;
  selectedCurveThreshold: CurveThreshold;
  expandedTreeNodes: string[];
  currentProperties: Map<string, string>;
}

export type Selectable = Server | Well | Wellbore | string | BhaRun | LogObject | LogCurveInfoRow[] | Trajectory | MessageObject | RiskObject | Rig | WbGeometryObject;

export const initNavigationStateReducer = (): [NavigationState, Dispatch<Action>] => {
  return useReducer(reducer, EMPTY_NAVIGATION_STATE);
};

export const EMPTY_NAVIGATION_STATE: NavigationState = {
  selectedServer: null,
  selectedWell: null,
  selectedWellbore: null,
  selectedBhaRunGroup: null,
  selectedLogGroup: null,
  selectedLogTypeGroup: null,
  selectedLog: null,
  selectedMessageGroup: null,
  selectedMessage: null,
  selectedRig: null,
  selectedRigGroup: null,
  selectedRiskGroup: null,
  selectedRisk: null,
  selectedLogCurveInfo: null,
  selectedTrajectoryGroup: null,
  selectedTrajectory: null,
  selectedTubularGroup: null,
  selectedTubular: null,
  selectedWbGeometryGroup: null,
  selectedWbGeometry: null,
  servers: [],
  currentSelected: null,
  wells: [],
  filteredWells: [],
  selectedFilter: EMPTY_FILTER,
  selectedCurveThreshold: DEFAULT_CURVE_THRESHOLD,
  expandedTreeNodes: [],
  currentProperties: new Map<string, string>()
};

export const reducer = (state: NavigationState, action: Action): NavigationState => {
  if (action.type in NavigationType) {
    return performNavigationAction(state, action);
  } else if (action.type in ModificationType) {
    return performModificationAction(state, action);
  } else {
    throw new Error("Action is of unknown type");
  }
};

const performNavigationAction = (state: NavigationState, action: Action) => {
  switch (action.type) {
    case NavigationType.ToggleTreeNode:
      return selectToggleTreeNode(state, action);
    case NavigationType.SelectServer:
      return selectServer(state, action);
    case NavigationType.SelectWell:
      return selectWell(state, action);
    case NavigationType.SelectWellbore:
      return selectWellbore(state, action);
    case NavigationType.SelectBhaRunGroup:
      return selectBhaRunGroup(state, action);
    case NavigationType.SelectLogGroup:
      return selectLogGroup(state, action);
    case NavigationType.SelectLogType:
      return selectLogType(state, action);
    case NavigationType.SelectLogObject:
      return selectLogObject(state, action);
    case NavigationType.SelectMessageGroup:
      return selectMessageGroup(state, action);
    case NavigationType.SelectMessageObject:
      return selectMessageObject(state, action);
    case NavigationType.SelectRiskGroup:
      return selectRiskGroup(state, action);
    case NavigationType.SelectRigGroup:
      return selectRigGroup(state, action);
    case NavigationType.SelectTrajectoryGroup:
      return selectTrajectoriesGroup(state, action);
    case NavigationType.SelectTrajectory:
      return selectTrajectory(state, action);
    case NavigationType.SelectTubularGroup:
      return selectTubularGroup(state, action);
    case NavigationType.SelectTubular:
      return selectTubular(state, action);
    case NavigationType.SelectWbGeometryGroup:
      return selectWbGeometryGroup(state, action);
    case NavigationType.SetFilter:
      return setFilter(state, action);
    case NavigationType.SetCurveThreshold:
      return setCurveThreshold(state, action);
    case NavigationType.ShowCurveValues:
      return selectLogCurveInfo(state, action);
    default:
      throw new Error();
  }
};

const performModificationAction = (state: NavigationState, action: Action) => {
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

const allDeselected: any = {
  selectedServer: null,
  selectedWell: null,
  selectedWellbore: null,
  selectedBhaRunGroup: null,
  selectedLogGroup: null,
  selectedLogTypeGroup: null,
  selectedLog: null,
  selectedMessageGroup: null,
  selectedMessage: null,
  selectedRiskGroup: null,
  selectedRisk: null,
  selectedLogCurveInfo: null,
  selectedRig: null,
  selectedRigGroup: null,
  selectedTrajectoryGroup: null,
  selectedTrajectory: null,
  selectedTubularGroup: null,
  selectedTubular: null,
  selectedWbGeometryGroup: null,
  selectedWbGeometry: null,
  currentSelected: null,
  currentProperties: new Map()
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
  const selectedMessage = state.selectedMessage?.uid === message.uid ? message : state.selectedMessage;
  return {
    ...state,
    wells: updatedWells,
    filteredWells: filterWells(updatedWells, state.selectedFilter),
    selectedMessage
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
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    wells: freshWells
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
  const selectedTrajectory: Trajectory = null;
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    selectedTrajectory,
    currentSelected: state.selectedTrajectoryGroup,
    wells: freshWells
  };
};

const updateWellboreTubulars = (state: NavigationState, { payload }: UpdateWellboreTubularsAction) => {
  const { wells } = state;
  const { tubulars, wellUid, wellboreUid } = payload;
  const freshWells = replacePropertiesInWellbore(wellUid, wells, wellboreUid, { tubulars });
  const selectedTubular = tubulars.find((value) => value.uid === state.selectedTubular?.uid) ?? null;
  return {
    ...state,
    ...updateSelectedWellAndWellboreIfNeeded(state, freshWells, wellUid, wellboreUid),
    selectedTubular,
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

const selectToggleTreeNode = (state: NavigationState, { payload }: ToggleTreeNodeAction) => {
  return {
    ...state,
    expandedTreeNodes: toggleTreeNode(state.expandedTreeNodes, payload.nodeId)
  };
};

const selectServer = (state: NavigationState, { payload }: SelectServerAction) => {
  const { server } = payload;
  const alreadySelected = server.id === state.selectedServer?.id;
  const expandedTreeNodes: string[] = [];
  return {
    ...state,
    ...allDeselected,
    currentSelected: server,
    selectedServer: server,
    wells: alreadySelected ? state.wells : [],
    filteredWells: alreadySelected ? state.filteredWells : [],
    expandedTreeNodes
  };
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
    wells: wells,
    filteredWells: filterWells(wells, state.selectedFilter)
  };
};

const selectWell = (state: NavigationState, { payload }: SelectWellAction) => {
  const { well, wellbores } = payload;
  const shouldExpandNode = !treeNodeIsExpanded(state.expandedTreeNodes, well.uid);
  const expandedTreeNodes = shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, well.uid) : state.expandedTreeNodes;
  if (state.selectedWell === well) {
    return {
      ...state,
      ...allDeselected,
      selectedServer: state.selectedServer,
      selectedWell: well,
      currentSelected: well,
      expandedTreeNodes: expandedTreeNodes,
      currentProperties: getWellProperties(well)
    };
  } else {
    const wellWithWellbores = { ...well, wellbores };
    const updatedWells = state.wells.map((w) => (w.uid === wellWithWellbores.uid ? wellWithWellbores : w));
    return {
      ...state,
      ...allDeselected,
      selectedServer: state.selectedServer,
      selectedWell: wellWithWellbores,
      currentSelected: wellWithWellbores,
      expandedTreeNodes: expandedTreeNodes,
      wells: updatedWells,
      filteredWells: filterWells(updatedWells, state.selectedFilter),
      currentProperties: getWellProperties(well)
    };
  }
};

const selectWellbore = (state: NavigationState, { payload }: SelectWellboreAction) => {
  const { well, wellbore, bhaRuns, logs, rigs, trajectories, messages, risks, tubulars, wbGeometrys } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateWellboreNodeId(wellbore), well.uid);
  const wellboreWithProperties = { ...wellbore, bhaRuns, logs, rigs, trajectories, messages, risks, tubulars, wbGeometrys };
  const updatedWellbores = well.wellbores.map((wB) => (wB.uid === wellboreWithProperties.uid ? wellboreWithProperties : wB));
  const updatedWell = { ...well, wellbores: updatedWellbores };
  const updatedWells = state.wells.map((w) => (w.uid === updatedWell.uid ? updatedWell : w));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: updatedWell,
    selectedWellbore: wellboreWithProperties,
    wells: updatedWells,
    filteredWells: filterWells(updatedWells, state.selectedFilter),
    currentSelected: wellboreWithProperties,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateWellboreNodeId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectBhaRunGroup = (state: NavigationState, { payload }: SelectBhaRunGroupAction) => {
  const { well, wellbore, bhaRunGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateBhaRunGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedBhaRunGroup: bhaRunGroup,
    currentSelected: bhaRunGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateBhaRunGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectLogGroup = (state: NavigationState, { payload }: SelectLogGroupAction) => {
  const { well, wellbore, logGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateLogGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedLogGroup: logGroup,
    currentSelected: logGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateLogGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectLogType = (state: NavigationState, { payload }: SelectLogTypeAction) => {
  const { well, wellbore, logGroup, logTypeGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, logTypeGroup, calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedLogGroup: logGroup,
    selectedLogTypeGroup: logTypeGroup,
    currentSelected: logTypeGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, logTypeGroup) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectLogObject = (state: NavigationState, { payload }: SelectLogObjectAction) => {
  const { log, well, wellbore } = payload;
  let expandedTreeNodes = state.expandedTreeNodes;

  const logGroup = calculateLogGroupId(wellbore);
  const shouldExpandLogGroup = shouldExpand(expandedTreeNodes, logGroup, calculateWellboreNodeId(wellbore));
  expandedTreeNodes = shouldExpandLogGroup ? toggleTreeNode(expandedTreeNodes, logGroup) : expandedTreeNodes;
  const logTypeGroup = calculateLogTypeId(wellbore, log.indexType);
  const shouldExpandLogTypeGroup = shouldExpand(expandedTreeNodes, logTypeGroup, calculateWellboreNodeId(wellbore));
  expandedTreeNodes = shouldExpandLogTypeGroup ? toggleTreeNode(expandedTreeNodes, logTypeGroup) : expandedTreeNodes;
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedLogGroup: logGroup,
    selectedLogTypeGroup: logTypeGroup,
    selectedLog: log,
    currentSelected: log,
    currentProperties: getLogObjectProperties(log),
    expandedTreeNodes
  };
};

const selectLogCurveInfo = (state: NavigationState, { payload }: SelectLogCurveInfoAction) => {
  const { logCurveInfo } = payload;
  return {
    ...state,
    selectedLogCurveInfo: logCurveInfo,
    currentSelected: logCurveInfo
  };
};

const selectRigGroup = (state: NavigationState, { payload }: SelectRigGroupAction) => {
  const { well, wellbore, rigGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateRigGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedRigGroup: rigGroup,
    currentSelected: rigGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateRigGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectMessageGroup = (state: NavigationState, { payload }: SelectMessageGroupAction) => {
  const { well, wellbore, messageGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateMessageGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedMessageGroup: messageGroup,
    currentSelected: messageGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateMessageGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectMessageObject = (state: NavigationState, { payload }: SelectMessageObjectAction) => {
  const { message, well, wellbore } = payload;
  let expandedTreeNodes = state.expandedTreeNodes;

  const messageGroup = calculateMessageGroupId(wellbore);
  const shouldExpandLogGroup = shouldExpand(expandedTreeNodes, messageGroup, calculateWellboreNodeId(wellbore));
  expandedTreeNodes = shouldExpandLogGroup ? toggleTreeNode(expandedTreeNodes, messageGroup) : expandedTreeNodes;
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedMessageGroup: messageGroup,
    selectedMessage: message,
    currentSelected: message,
    currentProperties: getMessageObjectProperties(message),
    expandedTreeNodes
  };
};

const selectRiskGroup = (state: NavigationState, { payload }: SelectRiskGroupAction) => {
  const { well, wellbore, riskGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateRiskGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedRiskGroup: riskGroup,
    currentSelected: riskGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateRiskGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectWbGeometryGroup = (state: NavigationState, { payload }: SelectWbGeometryGroupAction) => {
  const { well, wellbore, wbGeometryGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateWbGeometryGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedWbGeometryGroup: wbGeometryGroup,
    currentSelected: wbGeometryGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateWbGeometryGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectTrajectoriesGroup = (state: NavigationState, { payload }: SelectTrajectoryGroupAction) => {
  const { well, wellbore, trajectoryGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateTrajectoryGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedTrajectoryGroup: trajectoryGroup,
    currentSelected: trajectoryGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateTrajectoryGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectTrajectory = (state: NavigationState, { payload }: SelectTrajectoryAction) => {
  const { well, wellbore, trajectory, trajectoryGroup } = payload;
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedTrajectoryGroup: trajectoryGroup,
    selectedTrajectory: trajectory,
    currentSelected: trajectory,
    currentProperties: getTrajectoryProperties(trajectory, wellbore)
  };
};

const selectTubularGroup = (state: NavigationState, { payload }: SelectTubularGroupAction) => {
  const { well, wellbore, tubularGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateTubularGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedTubularGroup: tubularGroup,
    currentSelected: tubularGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateTubularGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectTubular = (state: NavigationState, { payload }: SelectTubularAction) => {
  const { well, wellbore, tubular, tubularGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateTubularGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedTubularGroup: tubularGroup,
    selectedTubular: tubular,
    currentSelected: tubular,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateTubularGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getTubularProperties(tubular, wellbore)
  };
};

const setFilter = (state: NavigationState, { payload }: SetFilterAction) => {
  const { filter } = payload;
  const filteredWells = filterWells(state.wells, filter);
  const wellIsSelectedAndPassesFilter = state.selectedWell && state.selectedWell.name && filterWells([state.selectedWell], filter).length > 0;
  if (wellIsSelectedAndPassesFilter) {
    return {
      ...state,
      selectedFilter: filter,
      filteredWells
    };
  }
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    currentSelected: state.selectedServer,
    selectedFilter: filter,
    filteredWells
  };
};

const setCurveThreshold = (state: NavigationState, { payload }: SetCurveThresholdAction) => {
  const { curveThreshold } = payload;
  return {
    ...state,
    selectedCurveThreshold: curveThreshold
  };
};

const treeNodeIsExpanded = (expandedTreeNodes: string[], nodeId: string) => {
  const nodeIndex = expandedTreeNodes.findIndex((expandedNode) => expandedNode === nodeId);
  return nodeIndex !== -1;
};

const shouldExpand = (expandedTreeNodes: string[], nodeId: string, parentNodeId: string) => {
  return treeNodeIsExpanded(expandedTreeNodes, parentNodeId) && !treeNodeIsExpanded(expandedTreeNodes, nodeId);
};

const toggleTreeNode = (expandedTreeNodes: string[], nodeId: string) => {
  const nodeIndexes = expandedTreeNodes.filter((expandedNode) => expandedNode.includes(nodeId));
  const shouldExpandNode = nodeIndexes.length === 0;
  if (shouldExpandNode) {
    return [...expandedTreeNodes, nodeId];
  } else {
    return expandedTreeNodes.filter((expandedNode) => !expandedNode.includes(nodeId));
  }
};

interface Action {
  type: any;
  payload: any;
}

export interface SelectServerAction extends Action {
  type: NavigationType.SelectServer;
  payload: { server: Server };
}

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

export interface ToggleTreeNodeAction extends Action {
  type: NavigationType.ToggleTreeNode;
  payload: { nodeId: string };
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

export interface UpdateWellboreMessagesAction extends Action {
  type: ModificationType.UpdateMessageObjects;
  payload: { messages: MessageObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateWellboreMessageAction extends Action {
  type: ModificationType.UpdateMessageObject;
  payload: { message: MessageObject };
}

export interface UpdateWellboreWbGeometrysAction extends Action {
  type: ModificationType.UpdateWbGeometryObjects;
  payload: { wbGeometrys: WbGeometryObject[]; wellUid: string; wellboreUid: string };
}

export interface UpdateServerListAction extends Action {
  type: ModificationType.UpdateServerList;
  payload: { servers: Server[] };
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

export interface SelectMessageObjectAction extends Action {
  type: NavigationType.SelectMessageObject;
  payload: { message: MessageObject; well: Well; wellbore: Wellbore };
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

export interface SelectRigAction extends Action {
  type: NavigationType.SelectRig;
  payload: { well: Well; wellbore: Wellbore; rig: Rig; rigGroup: any };
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

export interface SetFilterAction extends Action {
  type: NavigationType.SetFilter;
  payload: { filter: Filter };
}

export interface SetCurveThresholdAction extends Action {
  type: NavigationType.SetCurveThreshold;
  payload: { curveThreshold: CurveThreshold };
}

export type NavigationAction =
  | AddServerAction
  | AddWellAction
  | AddWellboreAction
  | RemoveWellAction
  | RemoveWellboreAction
  | RemoveWitsmlServerAction
  | UpdateServerAction
  | UpdateServerListAction
  | UpdateWellAction
  | UpdateWellsAction
  | UpdateWellboreAction
  | UpdateWellboreBhaRunsAction
  | UpdateWellboreLogAction
  | UpdateWellboreLogsAction
  | UpdateWellboreMessagesAction
  | UpdateWellboreMessageAction
  | UpdateWellboreRigsAction
  | UpdateWellboreRisksAction
  | UpdateWellboreTrajectoryAction
  | UpdateWellboreTrajectoriesAction
  | UpdateWellboreTubularAction
  | UpdateWellboreTubularsAction
  | UpdateWellboreWbGeometrysAction
  | ToggleTreeNodeAction
  | SelectBhaRunGroupAction
  | SelectLogTypeAction
  | SelectLogGroupAction
  | SelectLogCurveInfoAction
  | SelectLogObjectAction
  | SelectWellAction
  | SelectWellboreAction
  | SelectRigAction
  | SelectRigGroupAction
  | SelectMessageGroupAction
  | SelectMessageObjectAction
  | SelectRiskGroupAction
  | SelectServerAction
  | SelectTrajectoryAction
  | SelectTrajectoryGroupAction
  | SelectTubularAction
  | SelectTubularGroupAction
  | SelectWbGeometryGroupAction
  | SetFilterAction
  | SetCurveThresholdAction;
