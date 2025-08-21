import WellboreReference from "models/jobs/wellboreReference";

export default interface WellboreSubObjectsComparisonJob {
  countLogsData: boolean;
  checkLogsData: boolean;
  checkTimeBasedLogsData: boolean;
  sourceWellbore: WellboreReference;
  targetWellbore: WellboreReference;
}
