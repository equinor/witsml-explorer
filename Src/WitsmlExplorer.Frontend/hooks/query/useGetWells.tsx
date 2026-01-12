import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELLS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./useGetObjects";

export const getWellsQueryKey = (serverUrl: string) => {
  return [QUERY_KEY_WELLS, serverUrl?.toLowerCase()];
};

export const wellsQuery = (server: Server, options?: QueryOptions) => ({
  queryKey: getWellsQueryKey(server?.url),
  queryFn: () =>
    withQueryTiming(() => {
      const wells = WellService.getWells(null, server);
      return wells;
    }),
  ...options,
  enabled: !!server && !(options?.enabled === false)
});

type WellsQueryResult = Omit<
  QueryObserverResult<TimedResponse<Well[]>, unknown>,
  "data"
> & {
  wells: Well[];
  responseTime: number;
};

export const useGetWells = (
  server: Server,
  options?: QueryOptions
): WellsQueryResult => {
  const { data, ...state } = useQuery<TimedResponse<Well[]>>(
    wellsQuery(server, options)
  );
  return { wells: data?.data, responseTime: data?.responseTime, ...state };
};
