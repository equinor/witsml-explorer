import { SectionOrderStatus } from "../../../../models/dataWorkOrder/sectionOrderStatus.ts";
import React, { FC } from "react";
import Icon from "../../../../styles/Icons.tsx";
import { capitalize } from "lodash";
import { StyledStatusChip, TableFriendlyType } from "./styles.ts";

const SECTION_ORDER_VARIANT: {
  [key in SectionOrderStatus]: "error" | "active" | "default";
} = {
  [SectionOrderStatus.Approved]: "active",
  [SectionOrderStatus.Submitted]: "active",
  [SectionOrderStatus.Draft]: "default",
  [SectionOrderStatus.NoOrderedCurves]: "default"
};

type SectionOrderStatusChipProps = {
  status: SectionOrderStatus;
} & TableFriendlyType;

export const SectionOrderStatusChip: FC<SectionOrderStatusChipProps> = ({
  status,
  ...rest
}) => {
  const variant = SECTION_ORDER_VARIANT[status];

  if (status === SectionOrderStatus.Submitted)
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
