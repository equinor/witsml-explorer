import { createContext } from "react";
import { OperationAction, OperationState } from "./operationStateReducer";

export interface OperationContextProps {
  operationState: OperationState;
  dispatchOperation: (action: OperationAction) => void;
}

const OperationContext = createContext<OperationContextProps>({} as OperationContextProps);
export default OperationContext;
