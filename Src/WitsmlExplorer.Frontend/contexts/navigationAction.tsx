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
  CollapseTreeNodeChildrenAction,
  ExpandTreeNodesAction,
  SelectJobsAction,
  SelectLogCurveInfoAction,
  SelectLogTypeAction,
  SelectLogTypeActionGraph,
  SelectObjectAction,
  SelectObjectGroupAction,
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
  | CollapseTreeNodeChildrenAction
  | ExpandTreeNodesAction
  | SelectJobsAction
  | SelectLogTypeAction
  | SelectLogCurveInfoAction
  | SelectWellAction
  | SelectWellboreAction
  | SelectObjectAction
  | SelectObjectGroupAction
  | SelectServerAction
  | SetCurveThresholdAction
  | SelectServerManagerAction
  | SelectLogTypeActionGraph;

export type DispatchNavigation = (action: NavigationAction) => void;
