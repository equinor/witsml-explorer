import WellReference from "models/jobs/wellReference";
import {
  DecimalComparisonMode,
  TimezoneComparisonMode
} from "models/jobs/wellboreSubObjectsComparisonJob";

export default interface CompareWellJob {
  sourceWell: WellReference;
  targetWell: WellReference;
  compareWellboreObjects?: boolean;
  deepCompareObjects?: boolean;
  matchByNameIfUidDiffers?: boolean;
  omitCustomData?: boolean;
  omitTimestamps?: boolean;
  decimalMode?: DecimalComparisonMode;
  customDecimalPlaces?: number;
  timezoneMode?: TimezoneComparisonMode;
  timezone?: string;
  reportAllMismatches?: boolean;
  maxMismatches?: number;
}
