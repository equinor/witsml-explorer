import LogCurveInfo from "./logCurveInfo";

export default interface MultiLogCurveInfo extends LogCurveInfo {
  serverUrl?: string;
  logUid?: string;
}
