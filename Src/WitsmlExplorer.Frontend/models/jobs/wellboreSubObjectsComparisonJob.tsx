import WellboreReference from "models/jobs/wellboreReference";

export default interface WellboreSubObjectsComparisonJob {
  sourceWellbore: WellboreReference;
  targetWellbore: WellboreReference;
}
