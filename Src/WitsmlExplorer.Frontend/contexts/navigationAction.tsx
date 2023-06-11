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
  SelectJobsAction,
  SelectLogCurveInfoAction,
  SelectLogTypeAction,
  SelectObjectAction,
  SelectObjectGroupAction,
  SelectServerAction,
  SelectServerManagerAction,
  SelectWellAction,
  SelectWellboreAction,
  SetCurveThresholdAction,
  SetFilterAction,
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
  | SelectJobsAction
  | SelectLogTypeAction
  | SelectLogCurveInfoAction
  | SelectWellAction
  | SelectWellboreAction
  | SelectObjectAction
  | SelectObjectGroupAction
  | SelectServerAction
  | SetFilterAction
  | SetCurveThresholdAction
  | SelectServerManagerAction;
