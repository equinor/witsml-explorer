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
}

export const NULL_DEPTH_INDEX = "-999.25";
export const NULL_TIME_INDEX = "1900-01-01T00:00:00.000Z";

export const isNullOrEmptyIndex = (index: string) => {
  return !index || index === NULL_DEPTH_INDEX || index === NULL_TIME_INDEX;
};
