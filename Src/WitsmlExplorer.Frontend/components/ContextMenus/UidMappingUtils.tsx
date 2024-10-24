import { UidMappingDbQuery } from "../../models/uidMapping.tsx";
import UidMappingService from "../../services/uidMappingService.tsx";

export const getTargetWellboreID = async (dbQuery: UidMappingDbQuery) => {
  const mappings = await UidMappingService.queryUidMapping(dbQuery);
  if (mappings.length > 0) {
    return {
      targetWellId: mappings[0].targetWellId,
      targetWellboreId: mappings[0].targetWellboreId
    };
  } else {
    return {
      targetWellId: dbQuery.sourceWellId,
      targetWellboreId: dbQuery.sourceWellboreId
    };
  }
};
