import LogCurveInfoAxisDefinition from "./logCurveInfoAxisDefinition";
import Measure from "./measure";

export default interface LogCurveInfo {
  uid: string;
  mnemonic: string;
  minDateTimeIndex?: string;
  minDepthIndex?: string;
  maxDateTimeIndex?: string;
  maxDepthIndex?: string;
  classWitsml: string;
  unit: string;
  sensorOffset: Measure;
  mnemAlias: string;
  axisDefinitions: LogCurveInfoAxisDefinition[];
}
