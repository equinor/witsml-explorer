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
import { QUERY_KEY_WELLBORES } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getWellboreQueryKey } from "./useGetWellbore";

export const getWellboresQueryKey = (serverUrl: string, wellUid: string) => {
  return [
    QUERY_KEY_WELLBORES,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase()
  ];
};

export const invalidateWellboresQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: getWellboresQueryKey(serverUrl, wellUid)
  });
};

const updateIndividualWellbores = (
  queryClient: QueryClient,
  server: Server,
  wellbores: Wellbore[]
) => {
  wellbores.forEach((wellbore) =>
    queryClient.setQueryData<Wellbore>(
      getWellboreQueryKey(server?.url, wellbore.wellUid, wellbore.uid),
      wellbore
    )
  );
};

export const wellboresQuery = (
  queryClient: QueryClient,
  server: Server,
  wellUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellboresQueryKey(server?.url, wellUid),
  queryFn: async () => {
    const wells = await WellboreService.getWellbores(wellUid, null, server);
    updateIndividualWellbores(queryClient, server, wells);
    return wells;
  },
  ...options,
  enabled: !!server && !!wellUid && !(options?.enabled === false)
});

export interface WellsLoaderParams {
  serverUrl: string;
  wellUid: string;
}

export const wellboresLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs<WellsLoaderParams>): Promise<null> => {
    const { serverUrl, wellUid } = params;
    // Not sure if creating a new server object will have any side-effects, or if it's just the url that's used anyway.
    const server: Server = { ...emptyServer(), url: serverUrl };
    const query = wellboresQuery(queryClient, server, wellUid);
    queryClient.prefetchQuery(query);
    return null;
  };

type WellsQueryResult = Omit<
  QueryObserverResult<Wellbore[], unknown>,
  "data"
> & {
  wellbores: Wellbore[];
};

export const useGetWellbores = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellsQueryResult => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<Wellbore[]>(
    wellboresQuery(queryClient, server, wellUid, options)
  );
  return { wellbores: data, ...state };
};
