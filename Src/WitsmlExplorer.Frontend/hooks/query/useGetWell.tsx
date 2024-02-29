import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Server } from "../../models/server";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELL } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getWellsQueryKey } from "./useGetWells";

export const getWellQueryKey = (serverUrl: string, wellUid: string) => {
  return [QUERY_KEY_WELL, serverUrl?.toLowerCase(), wellUid?.toLowerCase()];
};

const updatePartialWells = (
  queryClient: QueryClient,
  server: Server,
  well: Well
) => {
  const existingWells = queryClient.getQueryData<Well[]>(
    getWellsQueryKey(server?.url)
  );
  if (existingWells) {
    const existingWellIndex = existingWells.findIndex(
      (w) => w.uid === well.uid
    );
    existingWells[existingWellIndex] = well;
    queryClient.setQueryData<Well[]>(
      getWellsQueryKey(server?.url),
      existingWells
    );
  }
};

export const wellQuery = (
  queryClient: QueryClient,
  server: Server,
  wellUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellQueryKey(server?.url, wellUid),
  queryFn: async () => {
    const well = await WellService.getWell(wellUid, null, server);
    updatePartialWells(queryClient, server, well);
    return well;
  },
  ...options,
  enabled: !!server && !!wellUid && !(options?.enabled === false),
  gcTime: Infinity // We don't want to garbage collect wells
});

type WellQueryResult = Omit<QueryObserverResult<Well, unknown>, "data"> & {
  well: Well;
};

export const useGetWell = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellQueryResult => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<Well>(
    wellQuery(queryClient, server, wellUid, options)
  );
  return { well: data, ...state };
};
