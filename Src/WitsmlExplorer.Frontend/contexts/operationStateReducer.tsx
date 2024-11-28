import UserCredentialsModal from "components/Modals/UserCredentialsModal";
import OperationType from "contexts/operationType";
import { Dispatch, ReactElement, useReducer } from "react";
import { Colors, light } from "styles/Colors";

export enum UserTheme {
  Compact = "compact",
  SemiCompact = "semiCompact",
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

export enum DateTimeFormat {
  Raw = "raw",
  Natural = "natural",
  RawNoOffset = "rawNoOffset"
}

export enum DecimalPreference {
  Decimal = "decimal",
  Raw = "raw"
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

export interface SetModeAction extends PayloadAction {
  type: OperationType.SetMode;
  payload: Colors;
}

export interface SetDateTimeFormatAction extends PayloadAction {
  type: OperationType.SetDateTimeFormat;
  payload: DateTimeFormat;
}

export interface SetHotKeysEnabledAction extends PayloadAction {
  type: OperationType.SetHotKeysEnabled;
  payload: boolean;
}

export interface SetDecimalAction extends PayloadAction {
  type: OperationType.SetDecimal;
  payload: DecimalPreference;
}

export interface OperationState {
  contextMenu: ContextMenu;
  progressIndicatorValue: number;
  modals: ReactElement[];
  theme: UserTheme;
  timeZone: TimeZone;
  colors: Colors;
  dateTimeFormat: DateTimeFormat;
  decimals: DecimalPreference;
  hotKeysEnabled: boolean;
}

export interface MousePosition {
  mouseX: number;
  mouseY: number;
}

export interface ContextMenu {
  component: ReactElement;
  position: MousePosition;
}

export const EMPTY_CONTEXT_MENU: ContextMenu = {
  component: null,
  position: { mouseX: null, mouseY: null }
};

const Light: Colors = light;

export const initOperationStateReducer = (): [
  OperationState,
  Dispatch<Action>
] => {
  const initialState: OperationState = {
    contextMenu: EMPTY_CONTEXT_MENU,
    progressIndicatorValue: 0,
    modals: [],
    theme: UserTheme.SemiCompact,
    timeZone: TimeZone.Raw,
    colors: Light,
    dateTimeFormat: DateTimeFormat.Raw,
    decimals: DecimalPreference.Raw,
    hotKeysEnabled: false
  };
  return useReducer(reducer, initialState);
};

export const reducer = (
  state: OperationState,
  action: Action | PayloadAction
): OperationState => {
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
    case OperationType.SetMode:
      return setMode(state, action as SetModeAction);
    case OperationType.SetDateTimeFormat:
      return setDateTimeFormat(state, action as SetDateTimeFormatAction);
    case OperationType.SetDecimal:
      return setDecimal(state, action as SetDecimalAction);
    case OperationType.SetHotKeysEnabled:
      return setHotKeysEnabled(state, action as SetHotKeysEnabledAction);
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

const displayModal = (
  state: OperationState,
  { payload }: DisplayModalAction
) => {
  const isUserCredentialsModal = payload.type === UserCredentialsModal;

  const modals = isUserCredentialsModal // We don't want to stack login modals
    ? state.modals
        .filter((modal) => modal.type !== UserCredentialsModal)
        .concat(payload)
    : state.modals.concat(payload);

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

const displayContextMenu = (
  state: OperationState,
  { payload }: DisplayContextMenuAction
) => {
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

const setMode = (state: OperationState, { payload }: SetModeAction) => {
  return {
    ...state,
    colors: payload
  };
};

const setDateTimeFormat = (
  state: OperationState,
  { payload }: SetDateTimeFormatAction
) => {
  return {
    ...state,
    dateTimeFormat: payload
  };
};

const setDecimal = (state: OperationState, { payload }: SetDecimalAction) => {
  return {
    ...state,
    decimals: payload
  };
};

const setHotKeysEnabled = (
  state: OperationState,
  { payload }: SetHotKeysEnabledAction
) => {
  return {
    ...state,
    hotKeysEnabled: payload
  };
};

export type OperationAction =
  | DisplayModalAction
  | HideModalAction
  | DisplayContextMenuAction
  | HideContextMenuAction
  | SetThemeAction
  | SetTimeZoneAction
  | SetModeAction
  | SetDateTimeFormatAction
  | SetDecimalAction
  | SetHotKeysEnabledAction;

export type DispatchOperation = (action: OperationAction) => void;
