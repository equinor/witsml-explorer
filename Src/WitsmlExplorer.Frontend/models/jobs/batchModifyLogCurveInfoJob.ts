import LogCurveInfo, { LogCurveInfoBatchItem } from "models/logCurveInfo";
import WellboreReference from "./wellboreReference";
export default interface BatchModifyLogCurveInfoJob {
  wellboreReference: WellboreReference;
  editedLogCurveInfo: LogCurveInfo;
  logCurveInfoBatchItems: LogCurveInfoBatchItem[];
}
