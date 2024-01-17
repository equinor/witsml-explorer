import ComponentReferences from "models/jobs/componentReferences";

export interface OffsetLogCurveJob {
  logCurveInfoReferences: ComponentReferences;
  timeOffsetMilliseconds: number;
  depthOffset: number;
}
