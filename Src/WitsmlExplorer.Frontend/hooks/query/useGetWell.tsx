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
import { QUERY_KEY_WELL } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getWellsQueryKey } from "./useGetWells";

export const getWellQueryKey = (serverUrl: string, wellUid: string) => {
  return [QUERY_KEY_WELL, serverUrl?.toLowerCase(), wellUid?.toLowerCase()];
};

export const invalidateWellQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: getWellQueryKey(serverUrl, wellUid)
  });
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
    // TODO: If the well has been deleted, we should remove it from the list.
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
  enabled: !!server && !!wellUid && !(options?.enabled === false)
});

export interface WellLoaderParams {
  serverUrl: string;
  wellUid: string;
}

export const wellLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs<WellLoaderParams>): Promise<null> => {
    const { serverUrl, wellUid } = params;
    // Not sure if creating a new server object will have any side-effects, or if it's just the url that's used anyway.
    const server: Server = { ...emptyServer(), url: serverUrl };
    const query = wellQuery(queryClient, server, wellUid);
    queryClient.prefetchQuery(query);
    return null;
  };

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
