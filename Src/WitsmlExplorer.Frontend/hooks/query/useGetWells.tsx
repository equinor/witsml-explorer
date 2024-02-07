import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";
import { Server, emptyServer } from "../../models/server";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELLS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getWellQueryKey } from "./useGetWell";

export const getWellsQueryKey = (serverUrl: string) => {
  return [QUERY_KEY_WELLS, serverUrl?.toLowerCase()];
};

export const invalidateWellsQuery = (
  queryClient: QueryClient,
  serverUrl: string
) => {
  queryClient.invalidateQueries({ queryKey: getWellsQueryKey(serverUrl) });
};

// TODO: Investigate if this can cause any race conditions.
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
  enabled: !!server && !(options?.enabled === false)
});

export interface WellsLoaderParams {
  serverUrl: string;
}

export const wellsLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs<WellsLoaderParams>): Promise<null> => {
    const { serverUrl } = params;
    // Not sure if creating a new server object will have any side-effects, or if it's just the url that's used anyway.
    const server: Server = { ...emptyServer(), url: serverUrl };
    const query = wellsQuery(queryClient, server);
    queryClient.prefetchQuery(query);
    return null;
  };

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
