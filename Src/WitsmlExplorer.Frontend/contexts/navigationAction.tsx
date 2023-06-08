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
  UpdateWellboreTrajectoryAction,
  UpdateWellboreTubularAction,
  UpdateWellboreWbGeometryAction,
  UpdateWellsAction
} from "./modificationActions";
import {
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
  ToggleTreeNodeAction,
  ToggleTreeNodeChildrenAction
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
  | UpdateWellboreLogAction
  | UpdateWellboreTrajectoryAction
  | UpdateWellboreTubularAction
  | UpdateWellboreWbGeometryAction
  | UpdateWellboreObjectsAction
  | ToggleTreeNodeAction
  | ToggleTreeNodeChildrenAction
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
