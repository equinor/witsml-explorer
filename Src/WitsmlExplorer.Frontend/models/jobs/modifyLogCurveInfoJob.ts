import ObjectReference from "models/jobs/objectReference";
import LogCurveInfo from "models/logCurveInfo";

export default interface ModifyLogCurveInfoJob {
  logReference: ObjectReference;
  logCurveInfo: LogCurveInfo;
}
