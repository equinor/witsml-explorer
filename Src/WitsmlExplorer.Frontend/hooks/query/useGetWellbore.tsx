import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";
import { Server, emptyServer } from "../../models/server";
import Wellbore from "../../models/wellbore";
import WellboreService from "../../services/wellboreService";
import { QUERY_KEY_WELLBORE } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getWellboresQueryKey } from "./useGetWellbores";

export const getWellboreQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) => {
  return [
    QUERY_KEY_WELLBORE,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase()
  ];
};

export const invalidateWellboreQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: getWellboreQueryKey(serverUrl, wellUid, wellboreUid)
  });
};

const updatePartialWellbores = (
  queryClient: QueryClient,
  server: Server,
  wellbore: Wellbore
) => {
  const existingWellbores = queryClient.getQueryData<Wellbore[]>(
    getWellboresQueryKey(server?.url, wellbore.wellUid)
  );
  if (existingWellbores) {
    const existingWellboreIndex = existingWellbores.findIndex(
      (w) => w.uid === wellbore.uid
    );
    existingWellbores[existingWellboreIndex] = wellbore;
    queryClient.setQueryData<Wellbore[]>(
      getWellboresQueryKey(server?.url, wellbore.wellUid),
      existingWellbores
    );
  }
};

export const wellboreQuery = (
  queryClient: QueryClient,
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellboreQueryKey(server?.url, wellUid, wellboreUid),
  queryFn: async () => {
    const wellbore = await WellboreService.getWellbore(
      wellUid,
      wellboreUid,
      null,
      server
    );
    updatePartialWellbores(queryClient, server, wellbore);
    return wellbore;
  },
  ...options,
  enabled: !!server && !!wellUid && !(options?.enabled === false)
});

export interface WellboreLoaderParams {
  serverUrl: string;
  wellboreUid: string;
}

export const wellboreLoader =
  (queryClient: QueryClient) =>
  async ({
    params
  }: LoaderFunctionArgs<WellboreLoaderParams>): Promise<null> => {
    const { serverUrl, wellUid, wellboreUid } = params;
    // Not sure if creating a new server object will have any side-effects, or if it's just the url that's used anyway.
    const server: Server = { ...emptyServer(), url: serverUrl };
    const query = wellboreQuery(queryClient, server, wellUid, wellboreUid);
    queryClient.prefetchQuery(query);
    return null;
  };

type WellboreQueryResult = Omit<
  QueryObserverResult<Wellbore, unknown>,
  "data"
> & {
  wellbore: Wellbore;
};

export const useGetWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): WellboreQueryResult => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<Wellbore>(
    wellboreQuery(queryClient, server, wellUid, wellboreUid, options)
  );
  return { wellbore: data, ...state };
};
