import { Dispatch, ReactElement, useReducer } from "react";
import OperationType from "./operationType";

export enum UserTheme {
  Compact = "compact",
  Comfortable = "comfortable"
}

//https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
//tz database time zone for each city was found through https://www.zeitverschiebung.net/en/
// "Brasilia" is the "Brasília" one where the first i is "i-acute"
export enum TimeZone {
  Local = "Local Time",
  Raw = "Original Timezone",
  Utc = "UTC",
  Brasilia = "America/Sao_Paulo",
  Berlin = "Europe/Berlin",
  London = "Europe/London",
  NewDelhi = "Asia/Kolkata",
  Houston = "America/Chicago"
}

interface Action {
  type: OperationType;
}

interface PayloadAction extends Action {
  payload: any;
}

export interface DisplayModalAction extends PayloadAction {
  type: OperationType.DisplayModal;
  payload: ReactElement;
}

export interface HideModalAction extends Action {
  type: OperationType.HideModal;
}

export interface DisplayContextMenuAction extends PayloadAction {
  type: OperationType.DisplayContextMenu;
  payload: ContextMenu;
}

export interface HideContextMenuAction extends Action {
  type: OperationType.HideContextMenu;
}

export interface SetThemeAction extends PayloadAction {
  type: OperationType.SetTheme;
  payload: UserTheme;
}

export interface SetTimeZoneAction extends PayloadAction {
  type: OperationType.SetTimeZone;
  payload: TimeZone;
}

export interface SetActiveWellsChecked extends PayloadAction {
  type: OperationType.ShowActiveWells;
  payload: boolean;
}

export interface SetGrowingLogs extends PayloadAction {
  type: OperationType.SetGrowing;
  payload: boolean;
}

export interface DisplayInactiveCurves extends PayloadAction {
  type: OperationType.DisplayInactiveTimeCurve;
  payload: boolean;
}

export interface OperationState {
  contextMenu: ContextMenu;
  progressIndicatorValue: number;
  modals: ReactElement[];
  theme: UserTheme;
  timeZone: TimeZone;
  ShowActiveWells: ShowActiveWells
  SetGrowing: SetGrowing
  DisplayInactiveTimeCurve: DisplayInactiveTimeCurve
}

export interface MousePosition {
  mouseX: number;
  mouseY: number;
}

export interface ContextMenu {
  component: ReactElement;
  position: MousePosition;
}

export interface ShowActiveWells {
  showActiveWells: boolean
}

export interface SetGrowing {
  showGrowingWells: boolean
}

export interface DisplayInactiveTimeCurve {
  displayInactiveTimeCurve: boolean
}

const EMPTY_CONTEXT_MENU: ContextMenu = { component: null, position: { mouseX: null, mouseY: null } };
const showDefaultActiveWells: ShowActiveWells = { showActiveWells: false };
const SetGrowing: SetGrowing = { showGrowingWells: false };
const displayInactiveTimeCurve: DisplayInactiveTimeCurve = { displayInactiveTimeCurve: false }

export const initOperationStateReducer = (): [OperationState, Dispatch<Action>] => {
  const initialState: OperationState = {
    contextMenu: EMPTY_CONTEXT_MENU,
    progressIndicatorValue: 0,
    modals: [],
    theme: UserTheme.Compact,
    timeZone: TimeZone.Local,
    ShowActiveWells: showDefaultActiveWells,
    SetGrowing: SetGrowing,
    DisplayInactiveTimeCurve: displayInactiveTimeCurve
  };
  return useReducer(reducer, initialState);
};

export const reducer = (state: OperationState, action: Action | PayloadAction): OperationState => {
  switch (action.type) {
    case OperationType.DisplayContextMenu:
      return displayContextMenu(state, action as DisplayContextMenuAction);
    case OperationType.HideContextMenu:
      return hideContextMenu(state);
    case OperationType.DisplayModal:
      return displayModal(state, action as DisplayModalAction);
    case OperationType.HideModal:
      return hideModal(state);
    case OperationType.SetTheme:
      return setTheme(state, action as SetThemeAction);
    case OperationType.SetTimeZone:
      return setTimeZone(state, action as SetTimeZoneAction);
    case OperationType.ShowActiveWells:
      return ShowActiveWells(state, action as SetActiveWellsChecked)
    case OperationType.DisplayInactiveTimeCurve:
      return ShowInactiveCurve(state, action as DisplayInactiveCurves)
    case OperationType.SetGrowing:
      return ShowGrowingLogs(state, action as SetGrowingLogs)
    default:
      throw new Error();
  }
};

const hideModal = (state: OperationState) => {
  const modals = [...state.modals];
  modals.pop();
  return {
    ...state,
    contextMenu: EMPTY_CONTEXT_MENU,
    modals
  };
};

const displayModal = (state: OperationState, { payload }: DisplayModalAction) => {
  const modals = state.modals.concat(payload);
  return {
    ...state,
    contextMenu: EMPTY_CONTEXT_MENU,
    modals
  };
};

const hideContextMenu = (state: OperationState) => {
  return {
    ...state,
    contextMenu: EMPTY_CONTEXT_MENU
  };
};

const displayContextMenu = (state: OperationState, { payload }: DisplayContextMenuAction) => {
  return {
    ...state,
    contextMenu: payload
  };
};

const setTheme = (state: OperationState, { payload }: SetThemeAction) => {
  return {
    ...state,
    theme: payload
  };
};

const setTimeZone = (state: OperationState, { payload }: SetTimeZoneAction) => {
  return {
    ...state,
    timeZone: payload
  };
};

const ShowActiveWells = (state: OperationState, { payload }: SetActiveWellsChecked) => {
  return {
    ...state,
    isActiveWellsChecked: payload
  }
}
const ShowInactiveCurve = (state: OperationState, { payload }: DisplayInactiveCurves) => {
  return {
    ...state,
    displayInactiveCurves: payload
  }
}

const ShowGrowingLogs = (state: OperationState, { payload }: SetGrowingLogs) => {
  return {
    ...state,
    displayInactiveCurves: payload
  }
}

export type OperationAction = DisplayModalAction | HideModalAction | DisplayContextMenuAction | HideContextMenuAction | SetThemeAction | SetTimeZoneAction | SetActiveWellsChecked | DisplayInactiveCurves | SetGrowingLogs;
