import ChannelConfiguration from "models/dataWorkOrder/channelConfiguration";
import ConfigurationChangeReason from "models/dataWorkOrder/configurationChangeReason";
import { OperationStatus } from "models/dataWorkOrder/operationStatus";
import { SectionOrderStatus } from "models/dataWorkOrder/sectionOrderStatus";
import Measure from "models/measure";
import RefNameString from "models/refNameString";

export default interface DataSourceConfiguration {
  versionNumber: number;
  uid: string;
  name: string;
  description: string;
  nominalHoleSize: Measure;
  tubular: RefNameString;
  status: SectionOrderStatus;
  timeStatus: OperationStatus;
  depthStatus: OperationStatus;
  dTimPlannedStart: string;
  dTimPlannedStop: string;
  mdPlannedStart: Measure;
  mdPlannedStop: Measure;
  dTimChangeDeadline: string;
  channelConfigurations: ChannelConfiguration[];
  changeReason: ConfigurationChangeReason;
}
