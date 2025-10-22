import { OperationStatus } from "../../../../models/dataWorkOrder/operationStatus.ts";

export const OPERATION_VARIANT: {
  [key in OperationStatus]: "error" | "active" | "default";
} = {
  [OperationStatus.Active]: "active",
  [OperationStatus.Completed]: "active",
  [OperationStatus.Inactive]: "default"
};
