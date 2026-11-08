import EntityType from "models/entityType";
import WellboreReference from "models/jobs/wellboreReference";

export enum DecimalComparisonMode {
  ServerSettings = "ServerSettings",
  AppSettings = "AppSettings",
  Custom = "Custom",
  Raw = "Raw"
}

export enum TimezoneComparisonMode {
  Utc = "Utc",
  AppSettings = "AppSettings",
  Raw = "Raw"
}

export interface LogMapping {
  sourceLogUid: string;
  sourceLogName?: string;
  targetLogUid: string;
  targetLogName?: string;
}

export default interface WellboreSubObjectsComparisonJob {
  sourceWellbore: WellboreReference;
  targetWellbore: WellboreReference;
  compareWellboreMetadata?: boolean;
  countLogsData?: boolean;
  checkLogsData?: boolean;
  checkTimeBasedLogsData?: boolean;
  checkDepthBasedLogsData?: boolean;
  objectTypesToCompare?: EntityType[];
  compareAllObjects?: boolean;
  deepCompareObjects?: boolean;
  matchByNameIfUidDiffers?: boolean;
  logMappings?: LogMapping[];
  omitCustomData?: boolean;
  omitTimestamps?: boolean;
  decimalMode?: DecimalComparisonMode;
  customDecimalPlaces?: number;
  timezoneMode?: TimezoneComparisonMode;
  timezone?: string;
  reportAllMismatches?: boolean;
  maxLogDataMismatches?: number;
  compareDepthLogs?: boolean;
  compareTimeLogs?: boolean;
  specificLogUidsOrNames?: string[];
  specificMnemonics?: string[];
  depthInterval?: number;
  depthStartIndex?: string;
  depthEndIndex?: string;
  timeIntervalSeconds?: number;
  timeStartIndex?: string;
  timeEndIndex?: string;
}
