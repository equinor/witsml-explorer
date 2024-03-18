import {
  LoggedInUsernamesAction,
  loggedInUsernamesReducer
} from "contexts/loggedInUsernamesReducer";
import { ReactNode, createContext, useContext, useReducer } from "react";

export interface LoggedInUsername {
  serverId: string;
  username: string;
}

interface LoggedInUsernamesContextType {
  loggedInUsernames: LoggedInUsername[];
  dispatchLoggedInUsernames: (action: LoggedInUsernamesAction) => void;
}

const LoggedInUsernamesContext =
  createContext<LoggedInUsernamesContextType>(null);

interface LoggedInUsernamesProviderProps {
  children: ReactNode;
}

/**
 * This context is utilized to store the currentUsername for server objects in between refreshes for caching purposes.
 * @param param0
 * @returns
 */
export function LoggedInUsernamesProvider({
  children
}: LoggedInUsernamesProviderProps) {
  const [loggedInUsernames, dispatchLoggedInUsernames] = useReducer(
    loggedInUsernamesReducer,
    []
  );

  return (
    <LoggedInUsernamesContext.Provider
      value={{ loggedInUsernames, dispatchLoggedInUsernames }}
    >
      {children}
    </LoggedInUsernamesContext.Provider>
  );
}

export function useLoggedInUsernames() {
  const context = useContext(LoggedInUsernamesContext);
  if (!context)
    throw new Error(
      `useLoggedInUsernames() has to be used within <LoggedInUsernamesProvider>`
    );
  return context;
}
