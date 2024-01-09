import {
  RemoveWellAction,
  RemoveWellboreAction,
  RemoveWitsmlServerAction,
  UpdateWellboreObjectAction
} from "contexts/modificationActions";
import ModificationType from "contexts/modificationType";
import { NavigationAction } from "contexts/navigationAction";
import {
  EMPTY_NAVIGATION_STATE,
  NavigationState,
  Selectable
} from "contexts/navigationContext";
import { reducer } from "contexts/navigationStateReducer";
import {
  LOG_1,
  SERVER_1,
  TRAJECTORY_1,
  WELLBORE_1,
  WELLBORE_2,
  WELLS,
  WELL_1,
  WELL_2,
  WELL_3,
  getInitialState
} from "contexts/stateReducerTestUtils";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Trajectory from "models/trajectory";
import Well from "models/well";
import Wellbore from "models/wellbore";

it("Should only update list of servers if no server selected", () => {
  const editedServer: Server = {
    ...SERVER_1,
    description: "Another description"
  };
  const updateServerAction = {
    type: ModificationType.UpdateServer,
    payload: { server: editedServer }
  };
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
  const editedServer: Server = {
    ...SERVER_1,
    description: "Another description"
  };
  const selectServerAction = {
    type: ModificationType.UpdateServer,
    payload: { server: editedServer }
  };
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
    currentSelected: editedServer,
    selectedServer: editedServer,
    servers: [editedServer]
  });
});

it("Should update list of servers when adding a server", () => {
  const newServer: Server = {
    id: "1",
    name: "New server",
    url: "https://example.com",
    description: "A new server",
    roles: [],
    credentialIds: [],
    depthLogDecimals: 0
  };
  const selectServerAction = {
    type: ModificationType.AddServer,
    payload: { server: newServer }
  };
  const actual = reducer({ ...getInitialState() }, selectServerAction);
  expect(actual).toStrictEqual({
    ...EMPTY_NAVIGATION_STATE,
    wells: WELLS,
    selectedServer: SERVER_1,
    servers: [SERVER_1, newServer]
  });
});

it("Should update logs for selected wellbore", () => {
  const updateLogOnWellbore: NavigationAction = {
    type: ModificationType.UpdateWellboreObjects,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      wellboreObjects: [{ ...LOG_1, name: "Updated" }],
      objectType: ObjectType.Log
    }
  };
  const initialState = {
    ...getInitialState(),
    selectedWell: { ...WELL_1 },
    selectedWellbore: { ...WELLBORE_1 }
  };

  const updatedWellbore = {
    ...WELLBORE_1,
    logs: [{ ...LOG_1, name: "Updated" }]
  };
  const updatedWell = { ...WELL_1, wellbores: [updatedWellbore] };

  const actual = reducer(initialState, updateLogOnWellbore);
  const expected = {
    ...getInitialState(),
    selectedWell: updatedWell,
    selectedWellbore: updatedWellbore,
    wells: [updatedWell, WELL_2, WELL_3]
  };
  expect(actual).toStrictEqual(expected);
});

it("Should update trajectories for selected wellbore", () => {
  const updatedTrajectory = { ...TRAJECTORY_1, name: "Updated" };
  const updateTrajectoryOnWellbore: NavigationAction = {
    type: ModificationType.UpdateWellboreObjects,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      wellboreObjects: [updatedTrajectory],
      objectType: ObjectType.Trajectory
    }
  };
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: { ...WELL_1 },
    selectedWellbore: { ...WELLBORE_1 },
    selectedObjectGroup: ObjectType.Trajectory,
    selectedObject: { ...TRAJECTORY_1 }
  };
  const updatedWellbore = { ...WELLBORE_1, trajectories: [updatedTrajectory] };
  const actual = reducer(initialState, updateTrajectoryOnWellbore);

  const updatedWell = { ...WELL_1, wellbores: [updatedWellbore] };
  expect(actual).toStrictEqual({
    ...getInitialState(),
    selectedWell: updatedWell,
    selectedWellbore: updatedWellbore,
    selectedObjectGroup: ObjectType.Trajectory,
    selectedObject: updatedTrajectory,
    wells: [updatedWell, WELL_2, WELL_3]
  });
});

it("Should update currentSelected if deleted", () => {
  const newTrajectories: Trajectory[] = [];
  const updateTrajectoryOnWellbore: NavigationAction = {
    type: ModificationType.UpdateWellboreObjects,
    payload: {
      wellUid: WELL_1.uid,
      wellboreUid: WELLBORE_1.uid,
      wellboreObjects: newTrajectories,
      objectType: ObjectType.Trajectory
    }
  };
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: { ...WELL_1 },
    selectedWellbore: { ...WELLBORE_1 },
    selectedObjectGroup: ObjectType.Trajectory,
    selectedObject: TRAJECTORY_1,
    currentSelected: TRAJECTORY_1
  };
  const updatedWellbore = { ...WELLBORE_1, trajectories: newTrajectories };
  const actual = reducer(initialState, updateTrajectoryOnWellbore);

  const updatedWell = { ...WELL_1, wellbores: [updatedWellbore] };
  const expected: NavigationState = {
    ...getInitialState(),
    selectedWell: updatedWell,
    selectedWellbore: updatedWellbore,
    selectedObjectGroup: ObjectType.Trajectory,
    selectedObject: null,
    currentSelected: ObjectType.Trajectory,
    wells: [updatedWell, WELL_2, WELL_3]
  };
  expect(actual).toStrictEqual(expected);
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
  const refreshedWellWithLogs = {
    ...refreshedWell,
    wellbores: [{ ...WELLBORE_1_WITH_LOGS, logs: [LOG_1] }]
  };
  const expectedListOfWells = [refreshedWellWithLogs, WELL_2, WELL_3];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
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
    selectedWell: WELL_1
  };
  expect(afterRefreshWell).toStrictEqual(expectedState);
});

it("Should update refreshed wellbore", () => {
  const WELLBORE_1_WITH_LOGS = { ...WELLBORE_1, logs: [LOG_1] };
  const wells = [
    { ...WELL_1, wellbores: [WELLBORE_1_WITH_LOGS] },
    WELL_2,
    WELL_3
  ];
  const initialState = {
    ...getInitialState(),
    wells,
    selectedWellbore: WELLBORE_1_WITH_LOGS
  };

  const refreshedWellbore = {
    ...WELLBORE_1,
    name: "wellbore1_renamed",
    logs: [LOG_1]
  };
  const refreshWellboreAction = {
    type: ModificationType.UpdateWellbore,
    payload: { wellbore: refreshedWellbore }
  };
  const afterRefreshWellbore = reducer(initialState, refreshWellboreAction);
  const refreshedWellboreWithLogs = { ...refreshedWellbore, logs: [LOG_1] };
  const expectedListOfWells = [
    { ...WELL_1, wellbores: [refreshedWellboreWithLogs] },
    WELL_2,
    WELL_3
  ];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
    selectedWellbore: refreshedWellboreWithLogs
  };
  expect(afterRefreshWellbore).toStrictEqual(expectedState);
});

it("Should update refreshed log object", () => {
  const wells = [
    { ...WELL_1, wellbores: [{ ...WELLBORE_1, logs: [LOG_1] }] },
    WELL_2,
    WELL_3
  ];
  const initialState = {
    ...getInitialState(),
    selectedObject: LOG_1,
    selectedObjectGroup: ObjectType.Log,
    wells
  };
  const refreshedLog = { ...LOG_1, name: "renamed log" };
  const refreshLogAction: UpdateWellboreObjectAction = {
    type: ModificationType.UpdateWellboreObject,
    payload: {
      objectToUpdate: refreshedLog,
      objectType: ObjectType.Log,
      isDeleted: false
    }
  };
  const afterRefreshLog = reducer(initialState, refreshLogAction);
  const expectedListOfWells = [
    { ...WELL_1, wellbores: [{ ...WELLBORE_1, logs: [refreshedLog] }] },
    WELL_2,
    WELL_3
  ];
  const expectedState = {
    ...getInitialState(),
    wells: expectedListOfWells,
    selectedObject: refreshedLog,
    selectedObjectGroup: ObjectType.Log
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
    wells: newWells
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
