import { OperationStatus } from "../../../../models/dataWorkOrder/operationStatus.ts";
import React, { FC } from "react";
import { Chip } from "../../../StyledComponents/Chip";
import Icon from "../../../../styles/Icons.tsx";
import { capitalize } from "lodash";

const OPERATION_VARIANT: {
  [key in OperationStatus]: "error" | "active" | "default";
} = {
  [OperationStatus.Active]: "active",
  [OperationStatus.Completed]: "active",
  [OperationStatus.Inactive]: "default"
};

type OperationStatusChipProps = {
  status: OperationStatus;
};

export const OperationStatusChip: FC<OperationStatusChipProps> = ({
  status
}) => {
  const variant = OPERATION_VARIANT[status];
  if (status === OperationStatus.Completed)
    return (
      <Chip variant={variant}>
        <Icon name="done" size={16} />
        {capitalize(status)}
      </Chip>
    );

  return <Chip variant={variant}>{capitalize(status)}</Chip>;
};
