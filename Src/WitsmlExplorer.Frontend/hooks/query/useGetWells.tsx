import {
  QueryClient,
  QueryObserverResult,
  useQuery
} from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { Server, emptyServer } from "../../models/server";
import Well from "../../models/well";
import { AuthorizationStatus } from "../../services/authorizationService";
import WellService from "../../services/wellService";

export const wellsQuery = (
  server: Server,
  abortSignal: AbortSignal = null
) => ({
  queryKey: ["wells", server?.url],
  queryFn: async () => {
    return await WellService.getWells(abortSignal);
  }
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
    const query = wellsQuery(server);
    queryClient.prefetchQuery(query);
    return null;
  };

const emptyList: Well[] = [];

type WellsQueryResult = Omit<QueryObserverResult<Well[], unknown>, "data"> & {
  wells: Well[];
};

export const useGetWells = (
  server: Server,
  abortSignal: AbortSignal = null
): WellsQueryResult => {
  const { authorizationState } = useAuthorizationState();
  const { data, ...state } = useQuery<Well[]>({
    ...wellsQuery(server, abortSignal),
    enabled:
      !!server && authorizationState?.status === AuthorizationStatus.Authorized
  });
  return { wells: data ?? emptyList, ...state };
};
