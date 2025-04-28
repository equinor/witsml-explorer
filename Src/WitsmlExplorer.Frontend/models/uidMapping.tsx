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

export type UidMappingDbQuery = Required<
  Pick<UidMapping, "sourceServerId" | "targetServerId">
> &
  Partial<
    Pick<
      UidMapping,
      "sourceWellId" | "sourceWellboreId" | "targetWellId" | "targetWellboreId"
    >
  >;

export interface UidMappingBasicInfo {
  sourceWellId: string;
  sourceWellboreId: string;
  targetServerId: string;
  targetServerName: string;
}
