import {
  OperationAction,
  OperationState
} from "contexts/operationStateReducer";
import { createContext } from "react";

export interface OperationContextProps {
  operationState: OperationState;
  dispatchOperation: (action: OperationAction) => void;
  isOperationStateHydrated: boolean;
}

const OperationContext = createContext<OperationContextProps>(
  {} as OperationContextProps
);
export default OperationContext;
