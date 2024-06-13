import OperationContext from "contexts/operationContext";
import { useContext } from "react";

export function useOperationState() {
  const context = useContext(OperationContext);
  if (!context)
    throw new Error(
      `useOperationState() has to be used within <OperationStateProvider>`
    );
  return context;
}
