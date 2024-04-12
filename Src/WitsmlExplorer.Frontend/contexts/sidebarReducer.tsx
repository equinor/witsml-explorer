export enum SidebarActionType {
  ExpandTreeNodes = "ExpandTreeNodes",
  ToggleTreeNode = "ToggleTreeNode",
  CollapseTreeNodes = "CollapseTreeNodes",
  SetTreeNodes = "SetTreeNodes"
}

export interface SidebarAction {
  type: any;
  payload: any;
}

export interface ToggleTreeNodeAction extends SidebarAction {
  type: SidebarActionType.ToggleTreeNode;
  payload: { nodeId: string };
}

export interface ExpandTreeNodesAction extends SidebarAction {
  type: SidebarActionType.ToggleTreeNode;
  payload: { nodeIds: string[] };
}

export interface CollapseTreeNodesAction extends SidebarAction {
  type: SidebarActionType.CollapseTreeNodes;
  payload: null;
}

export interface SetTreeNodesAction extends SidebarAction {
  type: SidebarActionType.SetTreeNodes;
  payload: { nodeIds: string[] };
}

export function sidebarReducer(
  state: string[],
  action: SidebarAction
): string[] {
  switch (action.type) {
    case SidebarActionType.ToggleTreeNode:
      return toggleTreeNode(state, action);
    case SidebarActionType.ExpandTreeNodes:
      return expandTreeNodes(state, action);
    case SidebarActionType.CollapseTreeNodes:
      return collapseTreeNodes();
    case SidebarActionType.SetTreeNodes:
      return setTreeNodes(action);
    default: {
      throw new Error(`Unsupported action type ${action.type}`);
    }
  }
}

const expandTreeNodes = (
  state: string[],
  { payload }: ExpandTreeNodesAction
): string[] => {
  const { nodeIds } = payload;
  const notIncludedNodes = nodeIds.filter((nodeId) => !state.includes(nodeId));
  if (notIncludedNodes.length > 0) return [...state, ...notIncludedNodes];
  return state;
};

// When toggling an expanded parent node, the children will also collapse.
const toggleTreeNode = (
  state: string[],
  { payload }: ToggleTreeNodeAction
): string[] => {
  const { nodeId } = payload;
  const nodeIndexes = state.filter((expandedNode) =>
    expandedNode.includes(nodeId)
  );
  const shouldExpandNode = nodeIndexes.length === 0;
  if (shouldExpandNode) {
    return [...state, nodeId];
  } else {
    return state.filter((expandedNode) => !expandedNode.includes(nodeId));
  }
};

const collapseTreeNodes = (): string[] => {
  return [];
};

const setTreeNodes = ({ payload }: SidebarAction): string[] => {
  return payload.nodeIds;
};
