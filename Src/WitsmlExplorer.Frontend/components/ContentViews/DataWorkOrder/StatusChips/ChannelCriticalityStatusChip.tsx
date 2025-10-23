import { ChannelCriticality } from "../../../../models/dataWorkOrder/channelCriticality.ts";
import { FC } from "react";
import { Chip } from "../../../StyledComponents/Chip";
import { capitalize } from "lodash";

const CRITICALITY_VARIANT: {
  [key in ChannelCriticality]: "default" | "active" | "warning";
} = {
  [ChannelCriticality.High]: "warning",
  [ChannelCriticality.Normal]: "default"
};

type ChannelCriticalityStatusChipProps = {
  status: ChannelCriticality;
};

export const ChannelCriticalityStatusChip: FC<
  ChannelCriticalityStatusChipProps
> = ({ status }) => (
  <Chip variant={CRITICALITY_VARIANT[status]}>{capitalize(status)}</Chip>
);
