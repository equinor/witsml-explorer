export interface UidMapping {
  sourceServerId: string;
  sourceWellId: string;
  sourceWellboreId: string;
  targetServerId: string;
  targetWellId: string;
  targetWellboreId: string;
  username?: string;
  timestamp?: string;
}

export type UidMappingDbQuery = Omit<
  UidMapping,
  "targetWellId" | "targetWellboreId" | "username" | "timeStamp"
>;
