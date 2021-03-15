import {
  EMPTY_NAVIGATION_STATE,
  NavigationState,
  reducer,
  RemoveWellAction,
  RemoveWellboreAction,
  RemoveWitsmlServerAction,
  Selectable,
  SelectServerAction,
  sortList,
  ToggleTreeNodeAction
} from "../navigationStateReducer";
import NavigationType from "../navigationType";
import Wellbore, {
  calculateLogGroupId,
  calculateLogTypeTimeId,
  calculateRigGroupId,
  calculateTrajectoryGroupId,
  calculateWellboreNodeId,
  getWellboreProperties
} from "../../models/wellbore";
import LogObject from "../../models/logObject";
import Well, { emptyWell, getWellProperties } from "../../models/well";
import Trajectory, { getTrajectoryProperties } from "../../models/trajectory";
import { Server } from "../../models/server";
import ModificationType from "../modificationType";
import Rig from "../../models/rig";

it("Should not update state when selecting current selected server", () => {
  const initialState = {
    ...getInitialState(),
    currentSelected: SERVER_1,
    wells: [WELL_1],
    filteredWells: [WELL_1],
    selectedFilter: WELL_1.name,
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
    selectedFilter: WELL_1.name,
    servers: [SERVER_1, SERVER_2]
  };
  const selectServerAction: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: SERVER_2 } };
  const actual = reducer(initialState, selectServerAction);
  expect(actual).toStrictEqual({
    ...initialState,
    selectedServer: SERVER_2,
    currentSelected: SERVER_2,
    wells: [],
    filteredWells: []
  });
});

it("Should only update list of servers if no server selected", () => {
  const editedServer: Server = { ...SERVER_1, description: "Another description" };
  const updateServerAction = { type: ModificationType.UpdateServer, payload: { server: editedServer } };
  const initialState = {
    ...EMPTY_NAVIGATION_STATE,
    servers: [SERVER_1]
  };
  const actual = reducer(initialState, updateServerAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    servers: [editedServer]
  });
});

it("Should update list of servers, and current selected, if editing current selected server", () => {
  const editedServer: Server = { ...SERVER_1, description: "Another description" };
  const selectServerAction = { type: ModificationType.UpdateServer, payload: { server: editedServer } };
  const initialState = {
    ...getInitialState(),
    selectedServer: SERVER_1,
    currentSelected: SERVER_1,
    servers: [SERVER_1]
  };
  const actual = reducer(initialState, selectServerAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    wells: WELLS,
    filteredWells: WELLS,
    currentSelected: editedServer,
    selectedServer: editedServer,
    servers: [editedServer]
  });
});

it("Should update list of servers when adding a server", () => {
  const newServer: Server = { id: "1", name: "New server", url: "https://example.com", description: "A new server" };
  const selectServerAction = { type: ModificationType.AddServer, payload: { server: newServer } };
  const actual = reducer({ ...getInitialState() }, selectServerAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    wells: WELLS,
    filteredWells: WELLS,
    selectedServer: SERVER_1,
    servers: [SERVER_1, newServer]
  });
});

it("Should also update selected well when a wellbore is selected", () => {
  const logs: LogObject[] = [];
  const rigs: Rig[] = [];
  const trajectories: Trajectory[] = [];
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: { well: WELL_2, wellbore: WELLBORE_2, logs, rigs, trajectories }
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

it("Should add rigs, logs and trajectories to a wellbore if it is selected for the first time", () => {
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: { well: WELL_3, wellbore: WELLBORE_3, logs: [LOG_1], rigs: [RIG_1], trajectories: [TRAJECTORY_1] }
  };
  const actual = reducer({ ...getInitialState(), expandedTreeNodes: [WELL_3.uid] }, selectWellboreAction);
  const expectedWellbore = { ...WELLBORE_3, logs: [LOG_1], rigs: [RIG_1], trajectories: [TRAJECTORY_1] };
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
    selectedFilter: "",
    currentProperties: getTrajectoryProperties(TRAJECTORY_1, WELLBORE_2)
  });
});

it("Should filter wells", () => {
  const setFilterAction = {
    type: NavigationType.SetFilter,
    payload: { filter: "2" }
  };
  const actual = reducer(getInitialState(), setFilterAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    servers: [SERVER_1],
    wells: WELLS,
    filteredWells: [WELL_2],
    selectedFilter: "2"
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

it("Should update logs for selected wellbore", () => {
  const updateLogOnWellbore = {
    type: ModificationType.UpdateLogObjects,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      logs: [{ ...LOG_1, name: "Updated" }]
    }
  };
  const initialState = {
    ...getInitialState(),
    selectedWell: { ...WELL_1 },
    selectedWellbore: { ...WELLBORE_1 }
  };

  const updatedWellbore = { ...WELLBORE_1, logs: [{ ...LOG_1, name: "Updated" }] };
  const updatedWell = { ...WELL_1, wellbores: [updatedWellbore] };

  const actual = reducer(initialState, updateLogOnWellbore);
  const expected = {
    ...getInitialState(),
    selectedWell: updatedWell,
    selectedWellbore: updatedWellbore,
    wells: [updatedWell, WELL_2, WELL_3],
    filteredWells: [updatedWell, WELL_2, WELL_3]
  };
  expect(actual).toStrictEqual(expected);
});

it("Should update trajectories for selected wellbore", () => {
  const updateTrajectoryOnWellbore = {
    type: ModificationType.UpdateTrajectoryOnWellbore,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      trajectories: [{ ...TRAJECTORY_1, name: "Updated" }]
    }
  };
  const initialState = {
    ...getInitialState(),
    selectedWell: { ...WELL_1 },
    selectedWellbore: { ...WELLBORE_1 },
    selectedTrajectoryGroup: TRAJECTORY_GROUP_1,
    selectedTrajectory: { ...TRAJECTORY_1 }
  };
  const updatedWellbore = { ...WELLBORE_1, trajectories: [{ ...TRAJECTORY_1, name: "Updated" }] };
  const actual = reducer(initialState, updateTrajectoryOnWellbore);

  const updatedWell = { ...WELL_1, wellbores: [updatedWellbore] };
  const selectedTrajectory: Trajectory = null;
  expect(actual).toStrictEqual({
    ...getInitialState(),
    selectedWell: updatedWell,
    selectedWellbore: updatedWellbore,
    selectedTrajectoryGroup: TRAJECTORY_GROUP_1,
    selectedTrajectory,
    currentSelected: TRAJECTORY_GROUP_1,
    wells: [updatedWell, WELL_2, WELL_3],
    filteredWells: [updatedWell, WELL_2, WELL_3]
  });
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
  const rigs: Rig[] = [];
  const trajectories: Trajectory[] = [];
  const selectWellboreAction = {
    type: NavigationType.SelectWellbore,
    payload: { well: WELL_1, wellbore: WELLBORE_1, logs, rigs, trajectories }
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

it("Should update refreshed well", () => {
  const WELLBORE_1_WITH_LOGS = { ...WELLBORE_1, logs: [LOG_1] };
  const WELL_1_WITH_LOGS = { ...WELL_1, wellbores: [WELLBORE_1_WITH_LOGS] };
  const wells = [WELL_1_WITH_LOGS, WELL_2, WELL_3];
  const initialState = {
    ...getInitialState(),
    wells,
    selectedWell: WELL_1_WITH_LOGS
  };
  const refreshedWell = { ...WELL_1, name: "well1_renamed" };
  const refreshWellAction = {
    type: ModificationType.UpdateWell,
    payload: { well: refreshedWell }
  };
  const afterRefreshWell = reducer(initialState, refreshWellAction);
  const refreshedWellWithLogs = { ...refreshedWell, wellbores: [{ ...WELLBORE_1_WITH_LOGS, logs: [LOG_1] }] };
  const expectedListOfWells = [refreshedWellWithLogs, WELL_2, WELL_3];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
    filteredWells: expectedListOfWells,
    selectedWell: refreshedWellWithLogs
  };

  expect(afterRefreshWell).toStrictEqual(expectedState);
});

it("Should update added well", () => {
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_1
  };
  const wellbores: Wellbore[] = [];
  const well1b = { uid: "well1b", name: "Well 1B", wellbores };
  const addWellAction = {
    type: ModificationType.AddWell,
    payload: { well: well1b }
  };
  const afterRefreshWell = reducer(initialState, addWellAction);

  const expectedListOfWells = [WELL_1, well1b, WELL_2, WELL_3];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
    filteredWells: expectedListOfWells,
    selectedWell: WELL_1
  };
  expect(afterRefreshWell).toStrictEqual(expectedState);
});

it("Should update refreshed wellbore", () => {
  const WELLBORE_1_WITH_LOGS = { ...WELLBORE_1, logs: [LOG_1] };
  const wells = [{ ...WELL_1, wellbores: [WELLBORE_1_WITH_LOGS] }, WELL_2, WELL_3];
  const initialState = {
    ...getInitialState(),
    wells,
    selectedWellbore: WELLBORE_1_WITH_LOGS
  };

  const refreshedWellbore = { ...WELLBORE_1, name: "wellbore1_renamed", logs: [LOG_1] };
  const refreshWellboreAction = {
    type: ModificationType.UpdateWellbore,
    payload: { wellbore: refreshedWellbore }
  };
  const afterRefreshWellbore = reducer(initialState, refreshWellboreAction);
  const refreshedWellboreWithLogs = { ...refreshedWellbore, logs: [LOG_1] };
  const expectedListOfWells = [{ ...WELL_1, wellbores: [refreshedWellboreWithLogs] }, WELL_2, WELL_3];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
    filteredWells: expectedListOfWells,
    selectedWellbore: refreshedWellboreWithLogs
  };
  expect(afterRefreshWellbore).toStrictEqual(expectedState);
});

it("Should update refreshed log object", () => {
  const wells = [{ ...WELL_1, wellbores: [{ ...WELLBORE_1, logs: [LOG_1] }] }, WELL_2, WELL_3];
  const initialState = {
    ...getInitialState(),
    selectedLog: LOG_1,
    wells,
    filteredWells: wells
  };
  const refreshedLog = { ...LOG_1, name: "renamed log" };
  const refreshLogAction = {
    type: ModificationType.UpdateLogObject,
    payload: { log: refreshedLog }
  };
  const afterRefreshLog = reducer(initialState, refreshLogAction);
  const expectedListOfWells = [{ ...WELL_1, wellbores: [{ ...WELLBORE_1, logs: [refreshedLog] }] }, WELL_2, WELL_3];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
    filteredWells: expectedListOfWells,
    selectedLog: refreshedLog
  };
  expect(afterRefreshLog).toStrictEqual(expectedState);
});

it("Should update wells", () => {
  const newWells = [WELL_2];
  const initialState = {
    ...getInitialState()
  };
  const updateWellsAction = {
    type: ModificationType.UpdateWells,
    payload: { wells: newWells }
  };
  const afterUpdateWells = reducer(initialState, updateWellsAction);

  const expectedState = {
    ...getInitialState(),
    wells: newWells,
    filteredWells: newWells
  };
  expect(afterUpdateWells).toStrictEqual(expectedState);
});

it("Should remove wellbore from list of wellbores and update selected items", () => {
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2
  };
  const removeWellboreAction: RemoveWellboreAction = {
    type: ModificationType.RemoveWellbore,
    payload: { wellUid: WELL_2.uid, wellboreUid: WELLBORE_2.uid }
  };
  const afterRemoveWellbore = reducer(initialState, removeWellboreAction);

  const expectedWellsList = [WELL_1, { ...WELL_2, wellbores: [] }, WELL_3];
  const expectedState = {
    ...getInitialState(),
    wells: expectedWellsList,
    filteredWells: expectedWellsList,
    selectedWell: WELL_2
  };
  expect(afterRemoveWellbore).toStrictEqual(expectedState);
});

it("Should remove well from list of wells and update selected items", () => {
  const initialState = {
    ...getInitialState(),
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2,
    currentSelected: WELLBORE_2
  };
  const removeWellAction: RemoveWellAction = {
    type: ModificationType.RemoveWell,
    payload: { wellUid: WELL_2.uid }
  };
  const afterRemoveWell = reducer(initialState, removeWellAction);

  const expectedWellsList = [WELL_1, WELL_3];
  const selectedWell: Well = null;
  const selectedWellbore: Wellbore = null;
  const currentSelected: Selectable = null;
  const expectedState: NavigationState = {
    ...getInitialState(),
    wells: expectedWellsList,
    filteredWells: expectedWellsList,
    selectedWell,
    selectedWellbore,
    currentSelected
  };
  expect(afterRemoveWell).toStrictEqual(expectedState);
});

it("Should remove server from list of servers and update selected items", () => {
  const initialState = {
    ...getInitialState(),
    selectedServer: SERVER_1,
    selectedWell: WELL_2,
    selectedWellbore: WELLBORE_2,
    currentSelected: WELLBORE_2
  };
  const removeServerAction: RemoveWitsmlServerAction = {
    type: ModificationType.RemoveServer,
    payload: { serverUid: SERVER_1.id }
  };
  const afterRemoveServer = reducer(initialState, removeServerAction);

  const selectedServer: Server = null;
  const expectedState: NavigationState = {
    ...getInitialState(),
    servers: [],
    selectedServer
  };
  expect(afterRemoveServer).toStrictEqual(expectedState);
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

const SERVER_1 = { id: "1", name: "WITSML server", url: "http://example.com", description: "Witsml server" };
const SERVER_2 = { id: "2", name: "WITSML server 2", url: "http://example2.com", description: "Witsml server 2" };
const WELLBORE_1: Wellbore = { uid: "wellbore1", wellUid: "well1", name: "Wellbore 1", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: "" };
const WELLBORE_2: Wellbore = { uid: "wellbore2", wellUid: "well2", name: "Wellbore 2", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: "" };
const WELLBORE_3: Wellbore = { uid: "wellbore3", wellUid: "well3", name: "Wellbore 3", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: "" };
const WELL_1: Well = { uid: "well1", name: "Well 1", wellbores: [WELLBORE_1], field: "", operator: "", country: "" };
const WELL_2: Well = { uid: "well2", name: "Well 2", wellbores: [WELLBORE_2], field: "", operator: "", country: "" };
const WELL_3: Well = { uid: "well3", name: "Well 3", wellbores: [WELLBORE_3], field: "", operator: "", country: "" };
const WELLS = [WELL_1, WELL_2, WELL_3];
const LOG_1: LogObject = { uid: "log1", name: "Log 1", wellUid: WELL_1.uid, wellboreUid: WELLBORE_1.uid };
const RIG_1 = { uid: "rig1", name: "Rig 1" };
const TRAJECTORY_1: Trajectory = {
  uid: "trajectory1",
  name: "Trajectory 1",
  wellUid: "",
  wellboreUid: "",
  aziRef: "",
  mdMax: 0,
  mdMin: 0,
  trajectoryStations: [],
  dTimTrajEnd: null,
  dTimTrajStart: null
};
const TRAJECTORY_GROUP_1 = "TrajectoryGroup";

const getInitialState = (): NavigationState => {
  const well1 = { ...WELL_1, wellbores: [{ ...WELLBORE_1 }] };
  const well2 = { ...WELL_2, wellbores: [{ ...WELLBORE_2 }] };
  const well3 = { ...WELL_3, wellbores: [{ ...WELLBORE_3 }] };
  const wells = [well1, well2, well3];
  const servers = [SERVER_1];
  return {
    ...EMPTY_NAVIGATION_STATE,
    selectedServer: SERVER_1,
    wells,
    filteredWells: wells,
    servers
  };
};
