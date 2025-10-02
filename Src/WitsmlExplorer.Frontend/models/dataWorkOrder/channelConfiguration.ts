import { ChannelCriticality } from "models/dataWorkOrder/channelCriticality";
import ChannelRequirement from "models/dataWorkOrder/channelRequirement";
import { LogIndexType } from "models/dataWorkOrder/logIndexType";
import Measure from "models/measure";

export default interface ChannelConfiguration {
  uid: string;
  mnemonic: string;
  uom: string;
  globalMnemonic: string;
  indexType: LogIndexType;
  toolName: string;
  service: string;
  sensorOffset: Measure;
  channelCriticality: ChannelCriticality;
  logName: string;
  description: string;
  comments: string;
  requirements: ChannelRequirement[];
}
