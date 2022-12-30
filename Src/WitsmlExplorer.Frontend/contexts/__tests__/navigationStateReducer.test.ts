import BhaRun from "../../models/bhaRun";
import LogObject from "../../models/logObject";
import MessageObject from "../../models/messageObject";
import { getObjectOnWellboreProperties } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Rig from "../../models/rig";
import RiskObject from "../../models/riskObject";
import Trajectory from "../../models/trajectory";
import Tubular from "../../models/tubular";
import WbGeometryObject from "../../models/wbGeometry";
import { emptyWell, getWellProperties } from "../../models/well";
import Wellbore, {
  calculateLogGroupId,
  calculateLogTypeTimeId,
  calculateRigGroupId,
  calculateTrajectoryGroupId,
  calculateWellboreNodeId,
  getWellboreProperties
} from "../../models/wellbore";
import { EMPTY_FILTER } from "../filter";
import { sortList } from "../modificationStateReducer";
import { SelectServerAction, ToggleTreeNodeAction } from "../navigationActions";
import { EMPTY_NAVIGATION_STATE, NavigationState, selectedManageServerFlag } from "../navigationContext";
import { reducer } from "../navigationStateReducer";
import NavigationType from "../navigationType";
import {
  BHARUN_1,
  FILTER_1,
  getInitialState,
  LOG_1,
  MESSAGE_1,
  RIG_1,
  RISK_1,
  SERVER_1,
  SERVER_2,
  TRAJECTORY_1,
  TRAJECTORY_GROUP_1,
  TUBULAR_1,
  WBGEOMETRY_1,
  WELLBORE_1,
  WELLBORE_2,
  WELLBORE_3,
  WELLS,
  WELL_1,
  WELL_2,
  WELL_3
} from "../stateReducerTestUtils";

it("Should not update state when selecting current selected server", () => {
  const initialState = {
    ...getInitialState(),
    currentSelected: SERVER_1,
    wells: [WELL_1],
    filteredWells: [WELL_1],
    selectedFilter: FILTER_1,
    servers: [SERVER_1, SERVER_2]
  };
  const selectServerAction: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: SERVER_1 } };
  const actual = reducer(initialState, selectServerAction);
  expect(actual).toStrictEqual({
    ...initialState
  });
});

it("Should update state when selecting another server", () => {
  const initialState = {
    ...getInitialState(),
    wells: [WELL_1],
    filteredWells: [WELL_1],
    selectedFilter: FILTER_1,
    servers: [SERVER_1, SERVER_2]
  };
  const selectServerAction: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: SERVER_2 } };
  const actual = reducer(initialState, selectServerAction);
  expect(actual).toStrictEqual({
    ...initialState,
    selectedServer: SERVER_2,
    currentSelected: selectedManageServerFlag,
    wells: [],
    filteredWells: []
  });
});

it("Should also update selected well when a wellbore is selected", () => {
  const bhaRuns: BhaRun[] = [];
  const logs: LogObject[] = [];
  const rigs: Rig[] = [];
  const risks: RiskObject[] = [];
  const messages: MessageObject[] = [];
  const tubulars: Tubular[] = [];
  const trajectories: Trajectory[] = [];
  const wbGeometrys: WbGeometryObject[] = [];
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: { well: WELL_2, wellbore: WELLBORE_2, bhaRuns, logs, rigs, trajectories, risks, messages, tubulars, wbGeometrys }
  };
  const actual = reducer({ ...getInitialState(), expandedTreeNodes: [WELL_2.uid] }, selectWellboreAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2,
    currentSelected: WELLBORE_2,
    servers: [SERVER_1],
    wells: WELLS,
    filteredWells: WELLS,
    expandedTreeNodes: [WELL_2.uid, "well2wellbore2"],
    currentProperties: getWellboreProperties(WELLBORE_2)
  });
});

it("Should add rigs, bhaRuns, logs, messages, trajectories, and tubulars to a wellbore if it is selected for the first time", () => {
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: {
      well: WELL_3,
      wellbore: WELLBORE_3,
      bhaRuns: [BHARUN_1],
      logs: [LOG_1],
      rigs: [RIG_1],
      trajectories: [TRAJECTORY_1],
      messages: [MESSAGE_1],
      risks: [RISK_1],
      tubulars: [TUBULAR_1],
      wbGeometrys: [WBGEOMETRY_1]
    }
  };
  const actual = reducer({ ...getInitialState(), expandedTreeNodes: [WELL_3.uid] }, selectWellboreAction);
  const expectedWellbore = {
    ...WELLBORE_3,
    bhaRuns: [BHARUN_1],
    logs: [LOG_1],
    rigs: [RIG_1],
    trajectories: [TRAJECTORY_1],
    messages: [MESSAGE_1],
    risks: [RISK_1],
    tubulars: [TUBULAR_1],
    wbGeometrys: [WBGEOMETRY_1]
  };
  const expectedWell = { ...WELL_3, wellbores: [expectedWellbore] };
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    selectedWell: expectedWell,
    selectedWellbore: expectedWellbore,
    currentSelected: expectedWellbore,
    servers: [SERVER_1],
    wells: [WELL_1, WELL_2, expectedWell],
    filteredWells: [WELL_1, WELL_2, expectedWell],
    expandedTreeNodes: ["well3", "well3wellbore3"],
    currentProperties: getWellboreProperties(WELLBORE_3)
  });
});

it("Should also update well and wellbore when a trajectory is selected", () => {
  const selectTrajectoryAction = {
    type: NavigationType.SelectTrajectory,
    payload: { well: WELL_2, wellbore: WELLBORE_2, trajectory: TRAJECTORY_1, trajectoryGroup: TRAJECTORY_GROUP_1 }
  };
  const actual = reducer(getInitialState(), selectTrajectoryAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2,
    selectedTrajectory: TRAJECTORY_1,
    selectedTrajectoryGroup: TRAJECTORY_GROUP_1,
    currentSelected: TRAJECTORY_1,
    servers: [SERVER_1],
    wells: WELLS,
    filteredWells: WELLS,
    selectedFilter: EMPTY_FILTER,
    currentProperties: getObjectOnWellboreProperties(TRAJECTORY_1, ObjectType.Trajectory)
  });
});

it("Should filter wells", () => {
  const setFilterAction = {
    type: NavigationType.SetFilter,
    payload: { filter: { ...EMPTY_FILTER, wellName: "2" } }
  };
  const actual = reducer(getInitialState(), setFilterAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    currentSelected: SERVER_1,
    servers: [SERVER_1],
    wells: WELLS,
    filteredWells: [WELL_2],
    selectedFilter: { ...EMPTY_FILTER, wellName: "2" }
  });
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

it("Should not reset selected wellbore if it is included in filter", () => {
  const selectWellAction = {
    type: NavigationType.SelectWell,
    payload: { well: WELL_3 }
  };
  const unfiltered = reducer(getInitialState(), selectWellAction);
  expect(unfiltered.selectedWell.uid).toStrictEqual(WELL_3.uid);
  const setFilterAction = {
    type: NavigationType.SetFilter,
    payload: { filter: "3" }
  };
  const filtered = reducer(unfiltered, setFilterAction);
  expect(filtered.selectedWell.uid).toStrictEqual(WELL_3.uid);
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
  const logs: LogObject[] = [];
  const bhaRuns: BhaRun[] = [];
  const rigs: Rig[] = [];
  const messages: MessageObject[] = [];
  const risks: RiskObject[] = [];
  const tubulars: Tubular[] = [];
  const trajectories: Trajectory[] = [];
  const wbGeometrys: WbGeometryObject[] = [];
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: { well: WELL_1, wellbore: WELLBORE_1, bhaRuns, logs, rigs, trajectories, messages, risks, tubulars, wbGeometrys }
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

it("Selecting a log group node twice should change nothing", () => {
  const wellbore1LogGroup = calculateLogGroupId(WELLBORE_1);
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedLogGroup: wellbore1LogGroup,
    currentSelected: wellbore1LogGroup,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1), wellbore1LogGroup],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const selectLogGroupAction = {
    type: NavigationType.SelectLogGroup,
    payload: { well: WELL_1, wellbore: WELLBORE_1, logGroup: wellbore1LogGroup }
  };
  const afterLogGroupSelect = reducer(initialState, selectLogGroupAction);
  const expected = { ...initialState };
  expect(afterLogGroupSelect).toStrictEqual(expected);
});

it("Selecting a log type group node twice should change nothing", () => {
  const logGroup = calculateLogGroupId(WELLBORE_1);
  const logTypeGroup = calculateLogTypeTimeId(WELLBORE_1);
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedLogGroup: logGroup,
    selectedLogTypeGroup: logTypeGroup,
    currentSelected: logTypeGroup,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1), logGroup, logTypeGroup],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const selectLogTypeGroupAction = {
    type: NavigationType.SelectLogType,
    payload: { well: WELL_1, wellbore: WELLBORE_1, logGroup: logGroup, logTypeGroup: logTypeGroup }
  };
  const afterLogTypeGroupSelect = reducer(initialState, selectLogTypeGroupAction);
  const expected = { ...initialState };
  expect(afterLogTypeGroupSelect).toStrictEqual(expected);
});

it("Selecting a rig group node twice should change nothing", () => {
  const rigGroup = calculateRigGroupId(WELLBORE_1);
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedRigGroup: rigGroup,
    currentSelected: rigGroup,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1), rigGroup],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const selectRigGroupAction = {
    type: NavigationType.SelectRigGroup,
    payload: { well: WELL_1, wellbore: WELLBORE_1, rigGroup: rigGroup }
  };
  const afterRigGroupSelect = reducer(initialState, selectRigGroupAction);
  const expected = { ...initialState };
  expect(afterRigGroupSelect).toStrictEqual(expected);
});

it("Selecting a trajectory group node twice should change nothing", () => {
  const trajectoryGroup = calculateTrajectoryGroupId(WELLBORE_1);
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedTrajectoryGroup: trajectoryGroup,
    currentSelected: trajectoryGroup,
    expandedTreeNodes: [WELL_1.uid, calculateWellboreNodeId(WELLBORE_1), trajectoryGroup],
    currentProperties: getWellboreProperties(WELLBORE_1)
  };
  const selectTrajectoryGroupAction = {
    type: NavigationType.SelectTrajectoryGroup,
    payload: { well: WELL_1, wellbore: WELLBORE_1, trajectoryGroup: trajectoryGroup }
  };
  const afterTrajectoryGroupSelect = reducer(initialState, selectTrajectoryGroupAction);
  const expected = { ...initialState };
  expect(afterTrajectoryGroupSelect).toStrictEqual(expected);
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
