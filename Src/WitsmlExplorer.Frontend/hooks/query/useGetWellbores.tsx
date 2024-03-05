import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Server } from "../../models/server";
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
    const wellbores = await WellboreService.getWellbores(wellUid, null, server);
    updateIndividualWellbores(queryClient, server, wellbores);
    return wellbores;
  },
  ...options,
  enabled: !!server && !!wellUid && !(options?.enabled === false)
});

type WellboresQueryResult = Omit<
  QueryObserverResult<Wellbore[], unknown>,
  "data"
> & {
  wellbores: Wellbore[];
};

export const useGetWellbores = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellboresQueryResult => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<Wellbore[]>(
    wellboresQuery(queryClient, server, wellUid, options)
  );
  return { wellbores: data, ...state };
};
