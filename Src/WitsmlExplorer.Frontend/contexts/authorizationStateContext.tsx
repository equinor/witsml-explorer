import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState
} from "react";
import { AuthorizationState } from "../services/authorizationService";

interface AuthorizationStateContextType {
  authorizationState: AuthorizationState;
  setAuthorizationState: Dispatch<SetStateAction<AuthorizationState>>;
}

const AuthorizationStateContext =
  createContext<AuthorizationStateContextType>(null);

interface AuthorizationStateProviderProps {
  children: ReactNode;
}

export function AuthorizationStateProvider({
  children
}: AuthorizationStateProviderProps) {
  const [authorizationState, setAuthorizationState] =
    useState<AuthorizationState>();

  return (
    <AuthorizationStateContext.Provider
      value={{ authorizationState, setAuthorizationState }}
    >
      {children}
    </AuthorizationStateContext.Provider>
  );
}

export function useAuthorizationState() {
  const context = useContext(AuthorizationStateContext);
  if (!context) {
    throw new Error(
      `useAuthorizationState has to be used within <AuthorizationStateProvider>`
    );
  }
  return context;
}
