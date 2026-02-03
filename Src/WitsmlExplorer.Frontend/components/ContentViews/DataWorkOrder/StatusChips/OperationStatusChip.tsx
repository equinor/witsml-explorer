import { OperationStatus } from "../../../../models/dataWorkOrder/operationStatus.ts";
import React, { FC } from "react";
import Icon from "../../../../styles/Icons.tsx";
import { capitalize } from "lodash";
import { StyledStatusChip, TableFriendlyType } from "./styles.ts";

const OPERATION_VARIANT: {
  [key in OperationStatus]: "error" | "active" | "default";
} = {
  [OperationStatus.Active]: "active",
  [OperationStatus.Completed]: "active",
  [OperationStatus.Inactive]: "default"
};

type OperationStatusChipProps = {
  status: OperationStatus;
} & TableFriendlyType;

export const OperationStatusChip: FC<OperationStatusChipProps> = ({
  status,
  ...rest
}) => {
  const variant = OPERATION_VARIANT[status];
  if (status === OperationStatus.Completed)
    return (
      <StyledStatusChip variant={variant} {...rest}>
        <Icon name="done" size={16} />
        {capitalize(status)}
      </StyledStatusChip>
    );

  return (
    <StyledStatusChip variant={variant} {...rest}>
      {capitalize(status)}
    </StyledStatusChip>
  );
};
