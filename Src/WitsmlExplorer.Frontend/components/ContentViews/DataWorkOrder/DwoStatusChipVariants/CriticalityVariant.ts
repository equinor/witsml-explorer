import { ChannelCriticality } from "../../../../models/dataWorkOrder/channelCriticality.ts";

export const CRITICALITY_VARIANT: {
  [key in ChannelCriticality]: "default" | "active" | "warning";
} = {
  [ChannelCriticality.High]: "warning",
  [ChannelCriticality.Normal]: "default"
};
