import { Dispatch, useReducer } from "react";
import LogObject from "../models/logObject";
import { getObjectOnWellboreProperties } from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import { getWellProperties } from "../models/well";
import { calculateLogTypeId, calculateObjectGroupId, calculateWellboreNodeId, getWellboreProperties } from "../models/wellbore";
import AuthorizationService from "../services/authorizationService";
import { filterWells } from "./filter";
import { performModificationAction } from "./modificationStateReducer";
import ModificationType from "./modificationType";
import {
  Action,
  SelectLogCurveInfoAction,
  SelectLogTypeAction,
  SelectObjectAction,
  SelectObjectGroupAction,
  SelectServerAction,
  SelectWellAction,
  SelectWellboreAction,
  SetCurveThresholdAction,
  SetFilterAction,
  ToggleTreeNodeAction
} from "./navigationActions";
import { EMPTY_NAVIGATION_STATE, NavigationState, allDeselected, selectedJobsFlag, selectedServerManagerFlag } from "./navigationContext";
import NavigationType from "./navigationType";

export const initNavigationStateReducer = (): [NavigationState, Dispatch<Action>] => {
  return useReducer(reducer, EMPTY_NAVIGATION_STATE);
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

const performNavigationAction = (state: NavigationState, action: Action): NavigationState => {
  switch (action.type) {
    case NavigationType.ToggleTreeNode:
      return selectToggleTreeNode(state, action);
    case NavigationType.SelectServer:
      return selectServer(state, action);
    case NavigationType.SelectWell:
      return selectWell(state, action);
    case NavigationType.SelectWellbore:
      return selectWellbore(state, action);
    case NavigationType.SelectJobs:
      return selectJobs(state);
    case NavigationType.SelectLogType:
      return selectLogType(state, action);
    case NavigationType.SelectObject:
      return selectObject(state, action);
    case NavigationType.SelectObjectGroup:
      return selectObjectGroup(state, action);
    case NavigationType.SetFilter:
      return setFilter(state, action);
    case NavigationType.SetCurveThreshold:
      return setCurveThreshold(state, action);
    case NavigationType.ShowCurveValues:
      return selectLogCurveInfo(state, action);
    case NavigationType.SelectServerManager:
      return selectServerManager(state);
    default:
      throw new Error();
  }
};

const selectToggleTreeNode = (state: NavigationState, { payload }: ToggleTreeNodeAction): NavigationState => {
  return {
    ...state,
    expandedTreeNodes: toggleTreeNode(state.expandedTreeNodes, payload.nodeId)
  };
};

const selectServer = (state: NavigationState, { payload }: SelectServerAction): NavigationState => {
  const { server } = payload;
  const alreadySelected = server != null && server.id === state.selectedServer?.id;
  const expandedTreeNodes: string[] = [];
  AuthorizationService.setSelectedServer(server);
  return {
    ...state,
    ...allDeselected,
    currentSelected: server ?? selectedServerManagerFlag,
    selectedServer: server,
    wells: alreadySelected ? state.wells : [],
    filteredWells: alreadySelected ? state.filteredWells : [],
    expandedTreeNodes
  };
};

const selectWell = (state: NavigationState, { payload }: SelectWellAction): NavigationState => {
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

const selectWellbore = (state: NavigationState, { payload }: SelectWellboreAction): NavigationState => {
  const { well, wellbore, bhaRuns, changeLogs, formationMarkers, logs, rigs, trajectories, messages, mudLogs, risks, tubulars, wbGeometrys } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateWellboreNodeId(wellbore), well.uid);
  const wellboreWithProperties = { ...wellbore, bhaRuns, changeLogs, formationMarkers, logs, rigs, trajectories, messages, mudLogs, risks, tubulars, wbGeometrys };
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

const selectJobs = (state: NavigationState): NavigationState => {
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    currentSelected: selectedJobsFlag
  };
};

const selectServerManager = (state: NavigationState): NavigationState => {
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    currentSelected: selectedServerManagerFlag
  };
};

const selectObjectGroup = (state: NavigationState, { payload }: SelectObjectGroupAction): NavigationState => {
  const { well, wellbore, objectType } = payload;
  const groupId = calculateObjectGroupId(wellbore, objectType);
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, groupId, calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedObjectGroup: objectType,
    currentSelected: objectType,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, groupId) : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectLogType = (state: NavigationState, { payload }: SelectLogTypeAction): NavigationState => {
  const { well, wellbore, logTypeGroup } = payload;
  const groupId = calculateObjectGroupId(wellbore, ObjectType.Log);
  const shouldExpandLogNode = shouldExpand(state.expandedTreeNodes, groupId, calculateWellboreNodeId(wellbore));
  const expandedTreeNodes = shouldExpandLogNode ? toggleTreeNode(state.expandedTreeNodes, groupId) : state.expandedTreeNodes;
  const shouldExpandNode = shouldExpand(expandedTreeNodes, logTypeGroup, calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedObjectGroup: ObjectType.Log,
    selectedLogTypeGroup: logTypeGroup,
    currentSelected: logTypeGroup,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(expandedTreeNodes, logTypeGroup) : expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectObject = (state: NavigationState, { payload }: SelectObjectAction): NavigationState => {
  const { object, well, wellbore, objectType } = payload;
  let expandedTreeNodes = state.expandedTreeNodes;

  const objectGroup = calculateObjectGroupId(wellbore, objectType);
  const shouldExpandLogGroup = shouldExpand(expandedTreeNodes, objectGroup, calculateWellboreNodeId(wellbore));
  expandedTreeNodes = shouldExpandLogGroup ? toggleTreeNode(expandedTreeNodes, objectGroup) : expandedTreeNodes;
  let logTypeGroup = null;
  if (objectType == ObjectType.Log) {
    logTypeGroup = calculateLogTypeId(wellbore, (object as LogObject).indexType);
    const shouldExpandLogTypeGroup = shouldExpand(expandedTreeNodes, logTypeGroup, calculateWellboreNodeId(wellbore));
    expandedTreeNodes = shouldExpandLogTypeGroup ? toggleTreeNode(expandedTreeNodes, logTypeGroup) : expandedTreeNodes;
  }
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedObjectGroup: objectType,
    selectedLogTypeGroup: logTypeGroup,
    selectedObject: object,
    currentSelected: object,
    currentProperties: getObjectOnWellboreProperties(object, objectType),
    expandedTreeNodes
  };
};

const selectLogCurveInfo = (state: NavigationState, { payload }: SelectLogCurveInfoAction): NavigationState => {
  const { logCurveInfo } = payload;
  return {
    ...state,
    selectedLogCurveInfo: logCurveInfo,
    currentSelected: logCurveInfo
  };
};

const setFilter = (state: NavigationState, { payload }: SetFilterAction): NavigationState => {
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

const setCurveThreshold = (state: NavigationState, { payload }: SetCurveThresholdAction): NavigationState => {
  const { curveThreshold } = payload;
  return {
    ...state,
    selectedCurveThreshold: curveThreshold
  };
};

export const treeNodeIsExpanded = (expandedTreeNodes: string[], nodeId: string): boolean => {
  const nodeIndex = expandedTreeNodes.findIndex((expandedNode) => expandedNode === nodeId);
  return nodeIndex !== -1;
};

const shouldExpand = (expandedTreeNodes: string[], nodeId: string, parentNodeId: string) => {
  return treeNodeIsExpanded(expandedTreeNodes, parentNodeId) && !treeNodeIsExpanded(expandedTreeNodes, nodeId);
};

export const toggleTreeNode = (expandedTreeNodes: string[], nodeId: string) => {
  const nodeIndexes = expandedTreeNodes.filter((expandedNode) => expandedNode.includes(nodeId));
  const shouldExpandNode = nodeIndexes.length === 0;
  if (shouldExpandNode) {
    return [...expandedTreeNodes, nodeId];
  } else {
    return expandedTreeNodes.filter((expandedNode) => !expandedNode.includes(nodeId));
  }
};
