import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Server } from "../../models/server";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELLS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getWellQueryKey } from "./useGetWell";

export const getWellsQueryKey = (serverUrl: string) => {
  return [QUERY_KEY_WELLS, serverUrl?.toLowerCase()];
};

const updateIndividualWells = (
  queryClient: QueryClient,
  server: Server,
  wells: Well[]
) => {
  wells.forEach((well) =>
    queryClient.setQueryData<Well>(getWellQueryKey(server?.url, well.uid), well)
  );
};

export const wellsQuery = (
  queryClient: QueryClient,
  server: Server,
  options?: QueryOptions
) => ({
  queryKey: getWellsQueryKey(server?.url),
  queryFn: async () => {
    const wells = await WellService.getWells(null, server);
    updateIndividualWells(queryClient, server, wells);
    return wells;
  },
  ...options,
  enabled: !!server && !(options?.enabled === false),
  gcTime: Infinity // We don't want to garbage collect wells
});

type WellsQueryResult = Omit<QueryObserverResult<Well[], unknown>, "data"> & {
  wells: Well[];
};

export const useGetWells = (
  server: Server,
  options?: QueryOptions
): WellsQueryResult => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<Well[]>(
    wellsQuery(queryClient, server, options)
  );
  return { wells: data, ...state };
};
