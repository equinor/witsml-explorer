import { performModificationAction } from "contexts/modificationStateReducer";
import ModificationType from "contexts/modificationType";
import {
  Action,
  CollapseTreeNodeChildrenAction,
  ExpandTreeNodesAction,
  SelectLogCurveInfoAction,
  SelectLogTypeAction,
  SelectObjectAction,
  SelectObjectGroupAction,
  SelectServerAction,
  SelectWellAction,
  SelectWellboreAction,
  SetCurveThresholdAction,
  ToggleTreeNodeAction
} from "contexts/navigationActions";
import {
  EMPTY_NAVIGATION_STATE,
  NavigationState,
  ViewFlags,
  allDeselected
} from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import LogObject from "models/logObject";
import ObjectOnWellbore, {
  getObjectOnWellboreProperties
} from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { getWellProperties } from "models/well";
import Wellbore, {
  WellboreObjects,
  calculateLogTypeDepthId,
  calculateLogTypeId,
  calculateObjectGroupId,
  calculateWellboreNodeId,
  getWellboreProperties,
  objectTypeToWellboreObjects
} from "models/wellbore";
import { Dispatch, useReducer } from "react";
import AuthorizationService from "services/authorizationService";

export const initNavigationStateReducer = (): [
  NavigationState,
  Dispatch<Action>
] => {
  return useReducer(reducer, EMPTY_NAVIGATION_STATE);
};

export const reducer = (
  state: NavigationState,
  action: Action
): NavigationState => {
  if (action.type in NavigationType) {
    return performNavigationAction(state, action);
  } else if (action.type in ModificationType) {
    return performModificationAction(state, action);
  } else {
    throw new Error("Action is of unknown type");
  }
};

const performNavigationAction = (
  state: NavigationState,
  action: Action
): NavigationState => {
  switch (action.type) {
    case NavigationType.ExpandTreeNodes:
      return expandTreeNodes(state, action);
    case NavigationType.ToggleTreeNode:
      return selectToggleTreeNode(state, action);
    case NavigationType.CollapseTreeNodeChildren:
      return collapseTreeNodeChildren(state, action);
    case NavigationType.SelectServer:
      return selectServer(state, action);
    case NavigationType.SelectWell:
      return selectWell(state, action);
    case NavigationType.SelectWellbore:
      return selectWellbore(state, action);
    case NavigationType.SelectJobs:
      return selectView(state, ViewFlags.Jobs);
    case NavigationType.SelectQueryView:
      return selectView(state, ViewFlags.Query);
    case NavigationType.SelectLogType:
      return selectLogType(state, action);
    case NavigationType.SelectObject:
      return selectObject(state, action);
    case NavigationType.SelectObjectGroup:
      return selectObjectGroup(state, action);
    case NavigationType.SetCurveThreshold:
      return setCurveThreshold(state, action);
    case NavigationType.ShowCurveValues:
      return selectLogCurveInfo(state, action);
    case NavigationType.SelectServerManager:
      return selectView(state, ViewFlags.ServerManager);
    case NavigationType.SelectObjectOnWellboreView:
      return selectView(state, ViewFlags.ObjectSearchView);
    default:
      throw new Error();
  }
};

const selectToggleTreeNode = (
  state: NavigationState,
  { payload }: ToggleTreeNodeAction
): NavigationState => {
  return {
    ...state,
    expandedTreeNodes: toggleTreeNode(state.expandedTreeNodes, payload.nodeId)
  };
};

const collapseTreeNodeChildren = (
  state: NavigationState,
  { payload }: CollapseTreeNodeChildrenAction
): NavigationState => {
  const { nodeId } = payload;
  if (!treeNodeIsExpanded(state.expandedTreeNodes, nodeId)) {
    return state;
  }
  return {
    ...state,
    expandedTreeNodes: toggleTreeNode(
      toggleTreeNode(state.expandedTreeNodes, nodeId),
      nodeId
    )
  };
};
const expandTreeNodes = (
  state: NavigationState,
  { payload }: ExpandTreeNodesAction
): NavigationState => {
  const { nodeIds } = payload;
  const { selectedWell, selectedWellbore, selectedObjectGroup } = state;
  const treeNodesToExpand: string[] = nodeIds;

  // This makes sure that a selected well/wellbore/object does not toggle expand state
  if (
    selectedWell &&
    state.expandedTreeNodes.includes(selectedWell.uid) &&
    !treeNodesToExpand.includes(selectedWell.uid)
  ) {
    treeNodesToExpand.push(selectedWell.uid);
  }
  if (
    selectedWellbore &&
    state.expandedTreeNodes.includes(calculateWellboreNodeId(selectedWellbore))
  ) {
    treeNodesToExpand.push(calculateWellboreNodeId(selectedWellbore));
  }
  if (
    selectedObjectGroup &&
    state.expandedTreeNodes.includes(
      calculateObjectGroupId(selectedWellbore, selectedObjectGroup)
    )
  ) {
    treeNodesToExpand.push(
      calculateObjectGroupId(selectedWellbore, selectedObjectGroup)
    );
  }
  if (
    selectedWellbore &&
    state.expandedTreeNodes.includes(calculateLogTypeDepthId(selectedWellbore))
  ) {
    treeNodesToExpand.push(calculateLogTypeDepthId(selectedWellbore));
  }

  return {
    ...state,
    expandedTreeNodes: treeNodesToExpand
  };
};

const selectServer = (
  state: NavigationState,
  { payload }: SelectServerAction
): NavigationState => {
  const { server } = payload;
  const alreadySelected =
    server != null && server.id === state.selectedServer?.id;
  const expandedTreeNodes: string[] = [];
  AuthorizationService.setSelectedServer(server);
  return {
    ...state,
    ...allDeselected,
    currentSelected: server ?? ViewFlags.ServerManager,
    selectedServer: server,
    wells: alreadySelected ? state.wells : [],
    expandedTreeNodes
  };
};

const selectWell = (
  state: NavigationState,
  { payload }: SelectWellAction
): NavigationState => {
  const { well } = payload;
  const shouldExpandNode = !treeNodeIsExpanded(
    state.expandedTreeNodes,
    well.uid
  );
  const expandedTreeNodes = shouldExpandNode
    ? toggleTreeNode(state.expandedTreeNodes, well.uid)
    : state.expandedTreeNodes;
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    currentSelected: well,
    expandedTreeNodes: expandedTreeNodes,
    currentProperties: getWellProperties(well)
  };
};

const selectWellbore = (
  state: NavigationState,
  { payload }: SelectWellboreAction
): NavigationState => {
  const { well, wellbore } = payload;
  const shouldExpandNode = shouldExpand(
    state.expandedTreeNodes,
    calculateWellboreNodeId(wellbore),
    well.uid
  );
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    currentSelected: wellbore,
    expandedTreeNodes: shouldExpandNode
      ? toggleTreeNode(
          state.expandedTreeNodes,
          calculateWellboreNodeId(wellbore)
        )
      : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectView = (
  state: NavigationState,
  flag: ViewFlags
): NavigationState => {
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    currentSelected: flag
  };
};

const selectObjectGroup = (
  state: NavigationState,
  { payload }: SelectObjectGroupAction
): NavigationState => {
  const { wellUid, wellboreUid, objectType, objects } = payload;
  // find the well and wellbore in state instead of passing them through payload
  // to avoid updating stale wellbores when multiple object groups are opened before objects are fetched
  const wellIndex = state.wells.findIndex((w) => w.uid === wellUid);
  const well = state.wells[wellIndex];
  const wellboreIndex = well.wellbores.findIndex((w) => w.uid === wellboreUid);
  const wellbore = well.wellbores[wellboreIndex];
  let wellAndWellboreState: Partial<NavigationState> = {
    selectedWell: well,
    selectedWellbore: wellbore
  };
  if (objects != null) {
    const namedObjects: Partial<
      Record<keyof WellboreObjects, ObjectOnWellbore[]>
    > = {};
    namedObjects[objectTypeToWellboreObjects(objectType)] = objects;
    const updatedWellbore: Wellbore = {
      ...wellbore,
      ...(namedObjects as Partial<WellboreObjects>)
    };
    const updatedWell = { ...well };
    updatedWell.wellbores.splice(wellboreIndex, 1, updatedWellbore);
    const freshWells = [...state.wells];
    freshWells.splice(wellIndex, 1, updatedWell);
    wellAndWellboreState = {
      selectedWell: updatedWell,
      selectedWellbore: updatedWellbore,
      wells: freshWells
    };
  }
  const groupId = calculateObjectGroupId(wellbore, objectType);
  const shouldExpandNode = shouldExpand(
    state.expandedTreeNodes,
    groupId,
    calculateWellboreNodeId(wellbore)
  );
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    ...wellAndWellboreState,
    selectedObjectGroup: objectType,
    currentSelected: objectType,
    expandedTreeNodes: shouldExpandNode
      ? toggleTreeNode(state.expandedTreeNodes, groupId)
      : state.expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectLogType = (
  state: NavigationState,
  { payload }: SelectLogTypeAction
): NavigationState => {
  const { well, wellbore, logTypeGroup } = payload;
  const groupId = calculateObjectGroupId(wellbore, ObjectType.Log);
  const shouldExpandLogNode = shouldExpand(
    state.expandedTreeNodes,
    groupId,
    calculateWellboreNodeId(wellbore)
  );
  const expandedTreeNodes = shouldExpandLogNode
    ? toggleTreeNode(state.expandedTreeNodes, groupId)
    : state.expandedTreeNodes;
  const shouldExpandNode = shouldExpand(
    expandedTreeNodes,
    logTypeGroup,
    calculateWellboreNodeId(wellbore)
  );
  return {
    ...state,
    ...allDeselected,
    selectedServer: state.selectedServer,
    selectedWell: well,
    selectedWellbore: wellbore,
    selectedObjectGroup: ObjectType.Log,
    selectedLogTypeGroup: logTypeGroup,
    currentSelected: logTypeGroup,
    expandedTreeNodes: shouldExpandNode
      ? toggleTreeNode(expandedTreeNodes, logTypeGroup)
      : expandedTreeNodes,
    currentProperties: getWellboreProperties(wellbore)
  };
};

const selectObject = (
  state: NavigationState,
  { payload }: SelectObjectAction
): NavigationState => {
  const { object, well, wellbore, objectType } = payload;
  let expandedTreeNodes = state.expandedTreeNodes;

  const objectGroup = calculateObjectGroupId(wellbore, objectType);
  const shouldExpandGroup = shouldExpand(
    expandedTreeNodes,
    objectGroup,
    calculateWellboreNodeId(wellbore)
  );
  expandedTreeNodes = shouldExpandGroup
    ? toggleTreeNode(expandedTreeNodes, objectGroup)
    : expandedTreeNodes;
  let logTypeGroup = null;
  if (objectType == ObjectType.Log) {
    logTypeGroup = calculateLogTypeId(
      wellbore,
      (object as LogObject).indexType
    );
    const shouldExpandLogTypeGroup = shouldExpand(
      expandedTreeNodes,
      logTypeGroup,
      calculateWellboreNodeId(wellbore)
    );
    expandedTreeNodes = shouldExpandLogTypeGroup
      ? toggleTreeNode(expandedTreeNodes, logTypeGroup)
      : expandedTreeNodes;
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

const selectLogCurveInfo = (
  state: NavigationState,
  { payload }: SelectLogCurveInfoAction
): NavigationState => {
  const { logCurveInfo } = payload;
  return {
    ...state,
    selectedLogCurveInfo: logCurveInfo,
    currentSelected: logCurveInfo
  };
};

const setCurveThreshold = (
  state: NavigationState,
  { payload }: SetCurveThresholdAction
): NavigationState => {
  const { curveThreshold } = payload;
  return {
    ...state,
    selectedCurveThreshold: curveThreshold
  };
};

export const treeNodeIsExpanded = (
  expandedTreeNodes: string[],
  nodeId: string
): boolean => {
  const nodeIndex = expandedTreeNodes.findIndex(
    (expandedNode) => expandedNode === nodeId
  );
  return nodeIndex !== -1;
};

const shouldExpand = (
  expandedTreeNodes: string[],
  nodeId: string,
  parentNodeId: string
) => {
  return (
    treeNodeIsExpanded(expandedTreeNodes, parentNodeId) &&
    !treeNodeIsExpanded(expandedTreeNodes, nodeId)
  );
};

export const toggleTreeNode = (expandedTreeNodes: string[], nodeId: string) => {
  const nodeIndexes = expandedTreeNodes.filter((expandedNode) =>
    expandedNode.includes(nodeId)
  );
  const shouldExpandNode = nodeIndexes.length === 0;
  if (shouldExpandNode) {
    return [...expandedTreeNodes, nodeId];
  } else {
    return expandedTreeNodes.filter(
      (expandedNode) => !expandedNode.includes(nodeId)
    );
  }
};
