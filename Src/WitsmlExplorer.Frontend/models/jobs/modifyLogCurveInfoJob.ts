import ObjectReference from "./objectReference";
import LogCurveInfo from "../logCurveInfo";

export default interface ModifyLogCurveInfoJob {
  logReference: ObjectReference;
  logCurveInfo: LogCurveInfo;
}
