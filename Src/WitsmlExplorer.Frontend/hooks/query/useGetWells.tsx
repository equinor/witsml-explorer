import { useQuery } from "@tanstack/react-query";
import Well from "models/well";
import { WitsmlProtocol } from "services/authorizationService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { Server } from "../../models/server";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELLS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

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
  placeholderData:
    options?.placeholderData == null
      ? undefined
      : ({
          data: {
            data: options?.placeholderData,
            usedProtocol: undefined
          },
          responseTime: 0
        } as TimedResponse<ProtocolAwareResponse<Well[]>>),
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
  usedProtocol?: WitsmlProtocol;
};

export const useGetWells = (
  server: Server,
  options?: QueryOptions
): WellsQueryResult => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<Well[]>>
  >(wellsQuery(server, options));

  const protocolAwareResult = timedResult?.data;
  const wells = protocolAwareResult?.data;

  return {
    wells: wells ?? [],
    responseTime: timedResult?.responseTime,
    error: state.error,
    isError: state.isError,
    isLoading: state.isLoading,
    isFetching: state.isFetching,
    dataUpdatedAt: state.dataUpdatedAt,
    usedProtocol: protocolAwareResult?.usedProtocol
  };
};
