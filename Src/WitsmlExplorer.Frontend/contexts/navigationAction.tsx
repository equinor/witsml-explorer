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
  UpdateWellboreBhaRunsAction,
  UpdateWellboreFormationMarkersAction,
  UpdateWellboreLogAction,
  UpdateWellboreLogsAction,
  UpdateWellboreMessageAction,
  UpdateWellboreMessagesAction,
  UpdateWellboreMudLogsAction,
  UpdateWellboreRigsAction,
  UpdateWellboreRisksAction,
  UpdateWellboreTrajectoriesAction,
  UpdateWellboreTrajectoryAction,
  UpdateWellboreTubularAction,
  UpdateWellboreTubularsAction,
  UpdateWellboreWbGeometryAction,
  UpdateWellboreWbGeometrysAction,
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
  | UpdateWellboreBhaRunsAction
  | UpdateWellboreFormationMarkersAction
  | UpdateWellboreLogAction
  | UpdateWellboreLogsAction
  | UpdateWellboreMessagesAction
  | UpdateWellboreMessageAction
  | UpdateWellboreMudLogsAction
  | UpdateWellboreRigsAction
  | UpdateWellboreRisksAction
  | UpdateWellboreTrajectoryAction
  | UpdateWellboreTrajectoriesAction
  | UpdateWellboreTubularAction
  | UpdateWellboreTubularsAction
  | UpdateWellboreWbGeometryAction
  | UpdateWellboreWbGeometrysAction
  | ToggleTreeNodeAction
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
