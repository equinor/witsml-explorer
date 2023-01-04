import Measure from "./measure";

export default interface LogCurveInfo {
  uid: string;
  mnemonic: string;
  minDateTimeIndex?: string;
  minDepthIndex?: number;
  maxDateTimeIndex?: string;
  maxDepthIndex?: number;
  classWitsml: string;
  unit: string;
  sensorOffset: Measure;
  mnemAlias: string;
}
