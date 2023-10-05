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
  UpdateWellborePartialAction,
  UpdateWellboreTrajectoryAction,
  UpdateWellboreTubularAction,
  UpdateWellboreWbGeometryAction,
  UpdateWellsAction
} from "./modificationActions";
import {
  CollapseAllTreeNodesAction,
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
} from "./navigationActions";

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
  | UpdateWellboreLogAction
  | UpdateWellboreTrajectoryAction
  | UpdateWellboreTubularAction
  | UpdateWellboreWbGeometryAction
  | UpdateWellboreObjectsAction
  | ToggleTreeNodeAction
  | CollapseAllTreeNodesAction
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
