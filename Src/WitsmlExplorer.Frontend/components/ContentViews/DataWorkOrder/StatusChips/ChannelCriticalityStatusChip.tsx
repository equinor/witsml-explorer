import { ChannelCriticality } from "../../../../models/dataWorkOrder/channelCriticality.ts";
import { FC } from "react";
import { capitalize } from "lodash";
import { StyledStatusChip, TableFriendlyType } from "./styles.ts";

const CRITICALITY_VARIANT: {
  [key in ChannelCriticality]: "default" | "active" | "warning";
} = {
  [ChannelCriticality.High]: "warning",
  [ChannelCriticality.Normal]: "default"
};

type ChannelCriticalityStatusChipProps = {
  status: ChannelCriticality;
} & TableFriendlyType;

export const ChannelCriticalityStatusChip: FC<
  ChannelCriticalityStatusChipProps
> = ({ status, ...rest }) => (
  <StyledStatusChip variant={CRITICALITY_VARIANT[status]} {...rest}>
    {capitalize(status)}
  </StyledStatusChip>
);
