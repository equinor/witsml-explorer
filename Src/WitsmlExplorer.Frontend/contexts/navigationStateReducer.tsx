import { Dispatch, useReducer } from "react";
import { getObjectOnWellboreProperties } from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import { getWellProperties } from "../models/well";
import {
  calculateBhaRunGroupId,
  calculateLogGroupId,
  calculateLogTypeId,
  calculateMessageGroupId,
  calculateRigGroupId,
  calculateRiskGroupId,
  calculateTrajectoryGroupId,
  calculateTubularGroupId,
  calculateWbGeometryGroupId,
  calculateWellboreNodeId,
  getWellboreProperties
} from "../models/wellbore";
import { filterWells } from "./filter";
import { performModificationAction } from "./modificationStateReducer";
import ModificationType from "./modificationType";
import {
  Action,
  SelectBhaRunGroupAction,
  SelectLogCurveInfoAction,
  SelectLogGroupAction,
  SelectLogObjectAction,
  SelectLogTypeAction,
  SelectMessageGroupAction,
  SelectMessageObjectAction,
  SelectRigGroupAction,
  SelectRiskGroupAction,
  SelectServerAction,
  SelectTrajectoryAction,
  SelectTrajectoryGroupAction,
  SelectTubularAction,
  SelectTubularGroupAction,
  SelectWbGeometryAction,
  SelectWbGeometryGroupAction,
  SelectWellAction,
  SelectWellboreAction,
  SetCurveThresholdAction,
  SetFilterAction,
  ToggleTreeNodeAction
} from "./navigationActions";
import { allDeselected, EMPTY_NAVIGATION_STATE, NavigationState, selectedJobsFlag } from "./navigationContext";
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
    case NavigationType.SelectJobs:
      return selectJobs(state);
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
    case NavigationType.SelectWbGeometry:
      return selectWbGeometry(state, action);
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

const selectJobs = (state: NavigationState) => {
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    currentSelected: selectedJobsFlag
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
    currentProperties: getObjectOnWellboreProperties(log, ObjectType.Log),
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
    currentProperties: getObjectOnWellboreProperties(message, ObjectType.Message),
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
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateTrajectoryGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedTrajectoryGroup: trajectoryGroup,
    selectedTrajectory: trajectory,
    currentSelected: trajectory,
    currentProperties: getObjectOnWellboreProperties(trajectory, ObjectType.Trajectory),
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateTrajectoryGroupId(wellbore)) : state.expandedTreeNodes
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
    currentProperties: getObjectOnWellboreProperties(tubular, ObjectType.Tubular)
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

const selectWbGeometry = (state: NavigationState, { payload }: SelectWbGeometryAction) => {
  const { well, wellbore, wbGeometry, wbGeometryGroup } = payload;
  const shouldExpandNode = shouldExpand(state.expandedTreeNodes, calculateWbGeometryGroupId(wellbore), calculateWellboreNodeId(wellbore));
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedWbGeometryGroup: wbGeometryGroup,
    selectedWbGeometry: wbGeometry,
    currentSelected: wbGeometry,
    expandedTreeNodes: shouldExpandNode ? toggleTreeNode(state.expandedTreeNodes, calculateWbGeometryGroupId(wellbore)) : state.expandedTreeNodes,
    currentProperties: getObjectOnWellboreProperties(wbGeometry, ObjectType.WbGeometry)
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
