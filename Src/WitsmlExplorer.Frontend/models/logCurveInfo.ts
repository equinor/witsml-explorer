import AxisDefinition from "models/AxisDefinition";
import Measure from "models/measure";

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
  curveDescription: string;
  typeLogData: string;
  mnemAlias: string;
  axisDefinitions: AxisDefinition[];
  traceState: string;
  nullValue: string;
}

export function EmptyLogCurveInfo(): LogCurveInfo {
  return {
    uid: "",
    mnemonic: "",
    minDateTimeIndex: null,
    minDepthIndex: null,
    maxDateTimeIndex: null,
    maxDepthIndex: null,
    classWitsml: null,
    unit: null,
    sensorOffset: null,
    curveDescription: "",
    typeLogData: "",
    mnemAlias: "",
    axisDefinitions: [],
    traceState: null,
    nullValue: ""
  };
}

export interface LogCurveInfoBatchItem {
  logCurveInfoUid: string;
  logUid: string;
}
