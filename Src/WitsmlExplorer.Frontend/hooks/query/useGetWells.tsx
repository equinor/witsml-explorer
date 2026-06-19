import { useQuery } from "@tanstack/react-query";
import Well from "models/well";
import { Server } from "../../models/server";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELLS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import {
  TimedResponse,
  withQueryTiming,
  wrapPlaceholderData
} from "./queryTiming";

export const getWellsQueryKey = (serverUrl: string) => {
  return [QUERY_KEY_WELLS, serverUrl?.toLowerCase()];
};

export const wellsQuery = (server: Server, options?: QueryOptions) => ({
  queryKey: getWellsQueryKey(server?.url),
  queryFn: () =>
    withQueryTiming(async () => {
      const wellsResult = await WellService.getWells(null, server);
      return wellsResult;
    }),
  ...options,
  placeholderData: wrapPlaceholderData(options?.placeholderData),
  enabled: !!server && !(options?.enabled === false)
});

type WellsQueryResult = {
  wells: Well[];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  dataUpdatedAt: number;
  responseTime: number;
};

export const useGetWells = (
  server: Server,
  options?: QueryOptions
): WellsQueryResult => {
  const { data, ...state } = useQuery<TimedResponse<Well[]>>(
    wellsQuery(server, options)
  );
  return {
    wells: data?.data,
    responseTime: data?.responseTime,
    error: state.error,
    isError: state.isError,
    isLoading: state.isLoading,
    isFetching: state.isFetching,
    dataUpdatedAt: state.dataUpdatedAt
  };
};
