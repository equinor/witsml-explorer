import React from "react";
import { ContextMenu, OperationState, reducer, UserTheme } from "../operationStateReducer";
import OperationType from "../operationType";

it("Should set context menu", () => {
  const setCurrentContextMenu = {
    type: OperationType.DisplayContextMenu,
    payload: { component: <></>, position: { mouseX: 0, mouseY: 0 } }
  };
  const actual = reducer(getEmptyState(), setCurrentContextMenu);
  expect(actual).toStrictEqual({
    ...getEmptyState(),
    contextMenu: { component: <></>, position: { mouseX: 0, mouseY: 0 } }
  });
});

it("Should hide context menu", () => {
  const removeCurrentContextMenu = {
    type: OperationType.HideContextMenu
  };
  const showingContextMenu = {
    ...getEmptyState(),
    contextMenu: { component: <></>, position: { mouseX: 0, mouseY: 0 } }
  };
  const actual = reducer(showingContextMenu, removeCurrentContextMenu);
  expect(actual).toStrictEqual({
    ...getEmptyState(),
    contextMenu: EMPTY_CONTEXT_MENU
  });
});

it("Should display properties modal and hide context menu", () => {
  const displayModal = {
    type: OperationType.DisplayModal,
    payload: <></>
  };
  const openContextMenu = {
    ...getEmptyState(),
    contextMenu: { component: <></>, position: { mouseX: 0, mouseY: 0 } },
    displayModal: false
  };
  const actual = reducer(openContextMenu, displayModal);
  expect(actual).toStrictEqual({
    ...getEmptyState(),
    contextMenu: EMPTY_CONTEXT_MENU,
    displayModal: true,
    modal: <></>
  });
});

const EMPTY_CONTEXT_MENU: ContextMenu = { component: null, position: { mouseX: null, mouseY: null } };
const getEmptyState = (): OperationState => {
  return {
    contextMenu: EMPTY_CONTEXT_MENU,
    displayModal: false,
    progressIndicatorValue: 0,
    theme: UserTheme.Compact,
    modal: null
  };
};
