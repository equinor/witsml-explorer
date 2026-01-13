import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import WellboreService from "../../services/wellboreService";
import { QUERY_KEY_WELLBORES } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

export const getWellboresQueryKey = (serverUrl: string, wellUid: string) => {
  return [
    QUERY_KEY_WELLBORES,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase()
  ];
};

export const wellboresQuery = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellboresQueryKey(server?.url, wellUid),
  queryFn: () =>
    withQueryTiming(() => {
      const wellbores = WellboreService.getWellbores(wellUid, null, server);
      return wellbores;
    }),
  ...options,
  enabled: !!server && wellUid != null && !(options?.enabled === false)
});

type WellboresQueryResult = Omit<
  QueryObserverResult<TimedResponse<Wellbore[]>, unknown>,
  "data"
> & {
  wellbores: Wellbore[];
  responseTime: number;
};

export const useGetWellbores = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellboresQueryResult => {
  const { data, ...state } = useQuery<TimedResponse<Wellbore[]>>(
    wellboresQuery(server, wellUid, options)
  );
  return { wellbores: data?.data, responseTime: data?.responseTime, ...state };
};
