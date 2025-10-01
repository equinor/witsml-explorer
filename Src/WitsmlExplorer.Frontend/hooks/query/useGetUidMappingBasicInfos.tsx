import { QUERY_KEY_UID_MAPPING_BASIC_INFOS } from "./queryKeys.tsx";
import { QueryOptions } from "./queryOptions.tsx";
import UidMappingService from "../../services/uidMappingService.tsx";
import { UidMappingBasicInfo } from "../../models/uidMapping.tsx";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server.ts";

export const getUidMappingBasicInfosQueryKey = () => {
  return [QUERY_KEY_UID_MAPPING_BASIC_INFOS];
};

export const uidMappingBasicInfosQuery = (
  server: Server,
  options?: QueryOptions
) => ({
  queryKey: getUidMappingBasicInfosQueryKey(),
  queryFn: async () => {
    return await UidMappingService.getUidMappingBasicInfos(server);
  },
  ...options,
  enabled: !!server && !(options?.enabled === false)
});

type UidMappingBasicInfosQueryResult = Omit<
  QueryObserverResult<UidMappingBasicInfo[], unknown>,
  "data"
> & {
  uidMappingBasicInfos: UidMappingBasicInfo[];
};

export const useGetUidMappingBasicInfos = (
  server: Server,
  options?: QueryOptions
): UidMappingBasicInfosQueryResult => {
  const { data, ...state } = useQuery<UidMappingBasicInfo[]>(
    uidMappingBasicInfosQuery(server, options)
  );

  return { uidMappingBasicInfos: data, ...state };
};
