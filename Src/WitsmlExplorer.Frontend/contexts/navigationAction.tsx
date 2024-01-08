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
import {
  CollapseTreeNodeChildrenAction,
  ExpandTreeNodesAction,
  SelectJobsAction,
  SelectLogCurveInfoAction,
  SelectLogTypeAction,
  SelectObjectAction,
  SelectObjectGroupAction,
  SelectObjectOnWellboreViewAction,
  SelectQueryViewAction,
  SelectServerAction,
  SelectServerManagerAction,
  SelectWellAction,
  SelectWellboreAction,
  SetCurveThresholdAction,
  ToggleTreeNodeAction
} from "contexts/navigationActions";

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
  | UpdateWellborePartialAction
  | UpdateWellboreObjectAction
  | UpdateWellboreObjectsAction
  | ToggleTreeNodeAction
  | CollapseTreeNodeChildrenAction
  | ExpandTreeNodesAction
  | SelectJobsAction
  | SelectQueryViewAction
  | SelectLogTypeAction
  | SelectLogCurveInfoAction
  | SelectWellAction
  | SelectWellboreAction
  | SelectObjectAction
  | SelectObjectGroupAction
  | SelectServerAction
  | SetCurveThresholdAction
  | SelectServerManagerAction
  | SelectObjectOnWellboreViewAction;

export type DispatchNavigation = (action: NavigationAction) => void;
