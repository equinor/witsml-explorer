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
  SelectLogObjectAction,
  SelectLogTypeAction,
  SelectMudLogAction,
  SelectObjectGroupAction,
  SelectServerAction,
  SelectServerManagerAction,
  SelectTrajectoryAction,
  SelectTubularAction,
  SelectWbGeometryAction,
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
  | SelectLogObjectAction
  | SelectWellAction
  | SelectWellboreAction
  | SelectMudLogAction
  | SelectObjectGroupAction
  | SelectServerAction
  | SelectTrajectoryAction
  | SelectTubularAction
  | SelectWbGeometryAction
  | SetFilterAction
  | SetCurveThresholdAction
  | SelectServerManagerAction;
