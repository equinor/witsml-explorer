import { Dispatch, ReactElement, useReducer } from "react";
import OperationType from "./operationType";

export enum UserTheme {
  Compact = "compact",
  Comfortable = "comfortable"
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

export interface OperationState {
  contextMenu: ContextMenu;
  displayModal: boolean;
  progressIndicatorValue: number;
  modal: ReactElement;
  theme: UserTheme;
}

export interface MousePosition {
  mouseX: number;
  mouseY: number;
}

export interface ContextMenu {
  component: ReactElement;
  position: MousePosition;
}

const EMPTY_CONTEXT_MENU: ContextMenu = { component: null, position: { mouseX: null, mouseY: null } };

export const initOperationStateReducer = (): [OperationState, Dispatch<Action>] => {
  const initialState: OperationState = {
    contextMenu: EMPTY_CONTEXT_MENU,
    displayModal: false,
    progressIndicatorValue: 0,
    modal: null,
    theme: UserTheme.Compact
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
    default:
      throw new Error();
  }
};

const hideModal = (state: OperationState) => {
  const modal: ReactElement = null;
  return {
    ...state,
    contextMenu: EMPTY_CONTEXT_MENU,
    displayModal: false,
    modal
  };
};

const displayModal = (state: OperationState, { payload }: DisplayModalAction) => {
  return {
    ...state,
    contextMenu: EMPTY_CONTEXT_MENU,
    displayModal: true,
    modal: payload
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

export type OperationAction = DisplayModalAction | HideModalAction | DisplayContextMenuAction | HideContextMenuAction | SetThemeAction;
