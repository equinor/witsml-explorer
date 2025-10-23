import { SectionOrderStatus } from "../../../../models/dataWorkOrder/sectionOrderStatus.ts";
import { Chip } from "../../../StyledComponents/Chip";
import React, { FC } from "react";
import Icon from "../../../../styles/Icons.tsx";
import { capitalize } from "lodash";

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
};

export const SectionOrderStatusChip: FC<SectionOrderStatusChipProps> = ({
  status
}) => {
  const variant = SECTION_ORDER_VARIANT[status];

  if (status === SectionOrderStatus.Submitted)
    return (
      <Chip variant={variant}>
        <Icon name="done" size={16} />
        {capitalize(status)}
      </Chip>
    );

  return <Chip variant={variant}>{capitalize(status)}</Chip>;
};
