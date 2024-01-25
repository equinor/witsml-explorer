import { sortList } from "contexts/modificationStateReducer";
import {
  SelectObjectAction,
  SelectObjectGroupAction,
  SelectServerAction,
  ToggleTreeNodeAction
} from "contexts/navigationActions";
import {
  EMPTY_NAVIGATION_STATE,
  NavigationState
} from "contexts/navigationContext";
import { reducer } from "contexts/navigationStateReducer";
import NavigationType from "contexts/navigationType";
import {
  LOG_1,
  SERVER_1,
  SERVER_2,
  TRAJECTORY_1,
  WELLBORE_1,
  WELLBORE_2,
  WELLS,
  WELL_1,
  WELL_2,
  getEmptyWellboreObjects,
  getInitialState
} from "contexts/stateReducerTestUtils";
import { getObjectOnWellboreProperties } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { emptyWell, getWellProperties } from "models/well";
import Wellbore, {
  calculateLogTypeTimeId,
  calculateObjectGroupId,
  calculateWellboreNodeId,
  getWellboreProperties
} from "models/wellbore";

it("Should not update state when selecting current selected server", () => {
  const initialState = {
    ...getInitialState(),
    currentSelected: SERVER_1,
    wells: [WELL_1],
    servers: [SERVER_1, SERVER_2]
  };
  const selectServerAction: SelectServerAction = {
    type: NavigationType.SelectServer,
    payload: { server: SERVER_1 }
  };
  const actual = reducer(initialState, selectServerAction);
  expect(actual).toStrictEqual({
    ...initialState
  });
});

it("Should update state when selecting another server", () => {
  const initialState = {
    ...getInitialState(),
    wells: [WELL_1],
    servers: [SERVER_1, SERVER_2]
  };
  const selectServerAction: SelectServerAction = {
    type: NavigationType.SelectServer,
    payload: { server: SERVER_2 }
  };
  const actual = reducer(initialState, selectServerAction);
  expect(actual).toStrictEqual({
    ...initialState,
    selectedServer: SERVER_2,
    currentSelected: SERVER_2,
    wells: []
  });
});

it("Should also update selected well when a wellbore is selected", () => {
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: {
      well: WELL_2,
      wellbore: WELLBORE_2,
      ...getEmptyWellboreObjects()
    }
  };
  const actual = reducer(
    { ...getInitialState(), expandedTreeNodes: [WELL_2.uid] },
    selectWellboreAction
  );
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2,
    currentSelected: WELLBORE_2,
    servers: [SERVER_1],
    wells: WELLS,
    expandedTreeNodes: [WELL_2.uid, "well2wellbore2"],
    currentProperties: getWellboreProperties(WELLBORE_2)
  });
});

it("Should also update well and wellbore when a trajectory is selected", () => {
  const selectTrajectoryAction: SelectObjectAction = {
    type: NavigationType.SelectObject,
    payload: {
      well: WELL_2,
      wellbore: WELLBORE_2,
      object: TRAJECTORY_1,
      objectType: ObjectType.Trajectory
    }
  };
  const actual = reducer(getInitialState(), selectTrajectoryAction);
  const expected: NavigationState = {
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2,
    selectedObject: TRAJECTORY_1,
    selectedObjectGroup: ObjectType.Trajectory,
    currentSelected: TRAJECTORY_1,
    servers: [SERVER_1],
    wells: WELLS,
    currentProperties: getObjectOnWellboreProperties(
      TRAJECTORY_1,
      ObjectType.Trajectory
    )
  };
  expect(actual).toStrictEqual(expected);
});

it("Should sort a list on name attrb. when adding new well/wellbore", () => {
  const wellA = emptyWell();
  const wellB = emptyWell();
  const wellC = emptyWell();
  wellA.name = "A-Well";
  wellB.name = "B-Well";
  wellC.name = "C-Well";
  const wellList = [wellC, wellA, wellB];
  sortList(wellList);
  expect(wellList).toStrictEqual([wellA, wellB, wellC]);
});

it("Selecting a well node twice should not change anything", () => {
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    currentSelected: WELL_1,
    expandedTreeNodes: [WELL_1.uid],
    currentProperties: getWellProperties(WELL_1)
  };
  const selectWellAction = {
    type: NavigationType.SelectWell,
    payload: { well: WELL_1, wellbores: [WELLBORE_1] }
  };
  const afterWellSelect = reducer(initialState, selectWellAction);
  expect(afterWellSelect).toStrictEqual(initialState);
});

it("Selecting a well node that is expanded but currently not selected should select it", () => {
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_2,
    currentSelected: WELL_2,
    expandedTreeNodes: [WELL_1.uid, WELL_2.uid]
  };
  const selectWellAction = {
    type: NavigationType.SelectWell,
    payload: { well: WELL_1, wellbores: [WELLBORE_1] }
  };
  const afterWellSelect = reducer(initialState, selectWellAction);
  const selectedWellbore: Wellbore = null;
  expect(afterWellSelect).toStrictEqual({
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore,
    currentSelected: WELL_1,
    expandedTreeNodes: [WELL_1.uid, WELL_2.uid],
    currentProperties: getWellProperties(WELL_1)
  });
});

it("Selecting a wellbore node that is expanded but currently not selected should select it", () => {
  const selectedWellbore: Wellbore = null;
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore,
    currentSelected: WELL_1,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1)],
    currentProperties: getWellProperties(WELL_1)
  };
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: {
      well: WELL_1,
      wellbore: WELLBORE_1,
      ...getEmptyWellboreObjects()
    }
  };
  const afterWellboreSelect = reducer(initialState, selectWellboreAction);
  const expected = {
    ...initialState,
    selectedWellbore: WELLBORE_1,
    currentSelected: WELLBORE_1,
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  expect(afterWellboreSelect).toStrictEqual(expected);
});

it("Selecting an object group node twice should change nothing", () => {
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedObjectGroup: ObjectType.Log,
    currentSelected: ObjectType.Log,
    expandedTreeNodes: [
      WELL_1.uid,
      calculateWellboreNodeId(WELLBORE_1),
      calculateObjectGroupId(WELLBORE_1, ObjectType.Log)
    ],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const action: SelectObjectGroupAction = {
    type: NavigationType.SelectObjectGroup,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      objectType: ObjectType.Log,
      objects: null
    }
  };
  const afterLogGroupSelect = reducer(initialState, action);
  const expected = { ...initialState };
  expect(afterLogGroupSelect).toStrictEqual(expected);
});

it("Selecting a log type group node twice should change nothing", () => {
  const logTypeGroup = calculateLogTypeTimeId(WELLBORE_1);
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedObjectGroup: ObjectType.Log,
    selectedLogTypeGroup: logTypeGroup,
    currentSelected: logTypeGroup,
    expandedTreeNodes: [
      WELL_1.uid,
      calculateWellboreNodeId(WELLBORE_1),
      calculateObjectGroupId(WELLBORE_1, ObjectType.Log),
      logTypeGroup
    ],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const selectLogTypeGroupAction = {
    type: NavigationType.SelectLogType,
    payload: { well: WELL_1, wellbore: WELLBORE_1, logTypeGroup: logTypeGroup }
  };
  const afterLogTypeGroupSelect = reducer(
    initialState,
    selectLogTypeGroupAction
  );
  const expected = { ...initialState };
  expect(afterLogTypeGroupSelect).toStrictEqual(expected);
});

it("Selecting a different object group should update the selectedObjectGroup", () => {
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedObjectGroup: ObjectType.Log,
    currentSelected: ObjectType.Log,
    expandedTreeNodes: [
      WELL_1.uid,
      calculateWellboreNodeId(WELLBORE_1),
      calculateObjectGroupId(WELLBORE_1, ObjectType.Log)
    ],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const action: SelectObjectGroupAction = {
    type: NavigationType.SelectObjectGroup,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      objectType: ObjectType.Rig,
      objects: null
    }
  };
  const afterRigGroupSelect = reducer(initialState, action);
  const expected: NavigationState = {
    ...initialState,
    selectedObjectGroup: ObjectType.Rig,
    currentSelected: ObjectType.Rig,
    expandedTreeNodes: [
      WELL_1.uid,
      calculateWellboreNodeId(WELLBORE_1),
      calculateObjectGroupId(WELLBORE_1, ObjectType.Log),
      calculateObjectGroupId(WELLBORE_1, ObjectType.Rig)
    ]
  };
  expect(afterRigGroupSelect).toStrictEqual(expected);
});

it("Selecting an object group should update the wellbore if passing objects", () => {
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    currentSelected: WELLBORE_1,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1)],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const action: SelectObjectGroupAction = {
    type: NavigationType.SelectObjectGroup,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      objectType: ObjectType.Log,
      objects: [LOG_1]
    }
  };
  const afterLogGroupSelect = reducer(initialState, action);
  const updatedWellbore = { ...WELLBORE_1, logs: [LOG_1] };
  const updatedWell = { ...WELL_1, wellbores: [updatedWellbore] };
  const expected: NavigationState = {
    ...initialState,
    wells: [updatedWell, initialState.wells[1], initialState.wells[2]],
    selectedWell: updatedWell,
    selectedWellbore: updatedWellbore,
    selectedObjectGroup: ObjectType.Log,
    currentSelected: ObjectType.Log,
    expandedTreeNodes: [
      WELL_1.uid,
      calculateWellboreNodeId(WELLBORE_1),
      calculateObjectGroupId(WELLBORE_1, ObjectType.Log)
    ]
  };
  expect(afterLogGroupSelect).toStrictEqual(expected);
});

it("Should expand (not select) a collapsed node when toggled", () => {
  const initialState = {
    ...getInitialState(),
    selectedServer: SERVER_1
  };
  const removeServerAction: ToggleTreeNodeAction = {
    type: NavigationType.ToggleTreeNode,
    payload: { nodeId: WELL_1.uid }
  };
  const afterRemoveServer = reducer(initialState, removeServerAction);
  const expectedState: NavigationState = {
    ...initialState,
    expandedTreeNodes: [WELL_1.uid]
  };
  expect(afterRemoveServer).toStrictEqual(expectedState);
});

it("Should collapse an expanded node when toggled", () => {
  const initialState = {
    ...getInitialState(),
    selectedServer: SERVER_1,
    selectedWell: WELL_1,
    currentSelected: WELL_1,
    expandedTreeNodes: [WELL_1.uid]
  };
  const removeServerAction: ToggleTreeNodeAction = {
    type: NavigationType.ToggleTreeNode,
    payload: { nodeId: WELL_1.uid }
  };
  const afterRemoveServer = reducer(initialState, removeServerAction);
  const expectedState: NavigationState = {
    ...initialState,
    expandedTreeNodes: []
  };
  expect(afterRemoveServer).toStrictEqual(expectedState);
});

it("Should collapse child nodes when toggling an expanded parent node", () => {
  const initialState = {
    ...getInitialState(),
    selectedServer: SERVER_1,
    selectedWell: WELL_1,
    currentSelected: WELL_1,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1)]
  };
  const removeServerAction: ToggleTreeNodeAction = {
    type: NavigationType.ToggleTreeNode,
    payload: { nodeId: WELL_1.uid }
  };
  const afterRemoveServer = reducer(initialState, removeServerAction);
  const expectedState: NavigationState = {
    ...initialState,
    expandedTreeNodes: []
  };
  expect(afterRemoveServer).toStrictEqual(expectedState);
});
