import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELLS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

export const getWellsQueryKey = (serverUrl: string) => {
  return [QUERY_KEY_WELLS, serverUrl?.toLowerCase()];
};

export const wellsQuery = (server: Server, options?: QueryOptions) => ({
  queryKey: getWellsQueryKey(server?.url),
  queryFn: async () => {
    const wells = await WellService.getWells(null, server);
    return wells;
  },
  ...options,
  enabled: !!server && !(options?.enabled === false)
});

type WellsQueryResult = Omit<QueryObserverResult<Well[], unknown>, "data"> & {
  wells: Well[];
};

export const useGetWells = (
  server: Server,
  options?: QueryOptions
): WellsQueryResult => {
  const { data, ...state } = useQuery<Well[]>(wellsQuery(server, options));
  return { wells: data, ...state };
};
