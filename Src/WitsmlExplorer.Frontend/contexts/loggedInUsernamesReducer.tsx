import { LoggedInUsername } from "contexts/loggedInUsernamesContext";

export enum LoggedInUsernamesActionType {
  AddLoggedInUsername = "AddLoggedInUsername"
}

export interface LoggedInUsernamesAction {
  type: any;
  payload: any;
}

export interface AddLoggedInUsernameAction extends LoggedInUsernamesAction {
  type: LoggedInUsernamesActionType.AddLoggedInUsername;
  payload: LoggedInUsername;
}

export function loggedInUsernamesReducer(
  state: LoggedInUsername[],
  action: LoggedInUsernamesAction
): LoggedInUsername[] {
  switch (action.type) {
    case LoggedInUsernamesActionType.AddLoggedInUsername:
      return addLoggedInUsername(state, action);
    default: {
      throw new Error(`Unsupported action type ${action.type}`);
    }
  }
}

const addLoggedInUsername = (
  state: LoggedInUsername[],
  { payload }: LoggedInUsernamesAction
): LoggedInUsername[] => {
  const loggedInUsernames = structuredClone(state);
  const newLoggedInUsername: LoggedInUsername = structuredClone(payload);
  const index = loggedInUsernames.findIndex(
    (loggedInUsername) =>
      loggedInUsername.serverId === newLoggedInUsername.serverId
  );
  if (index === -1) {
    loggedInUsernames.push(newLoggedInUsername);
  } else if (index >= 0) {
    loggedInUsernames.splice(index, 1, newLoggedInUsername);
  }
  return loggedInUsernames;
};
