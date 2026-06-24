import { useQuery } from "@tanstack/react-query";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { Server } from "../../models/server";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { QUERY_KEY_WELL } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

export const getWellQueryKey = (serverUrl: string, wellUid: string) => {
  return [QUERY_KEY_WELL, serverUrl?.toLowerCase(), wellUid?.toLowerCase()];
};

export const wellQuery = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellQueryKey(server?.url, wellUid),
  queryFn: () =>
    withQueryTiming(async () => {
      const well = await WellService.getWell(wellUid, null, server);
      return well;
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
        } as TimedResponse<ProtocolAwareResponse<Well>>),
  enabled: !!server && !!wellUid && !(options?.enabled === false)
});

type WellQueryResult = {
  well: Well;
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: string;
};

export const useGetWell = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellQueryResult => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<Well>>
  >(wellQuery(server, wellUid, options));
  const protocolAwareResult = timedResult?.data;
  const well = protocolAwareResult?.data;

  return {
    well,
    responseTime: timedResult?.responseTime,
    error: state.error,
    isError: state.isError,
    isLoading: state.isLoading,
    isFetching: state.isFetching,
    isFetched: state.isFetched,
    dataUpdatedAt: state.dataUpdatedAt,
    usedProtocol: protocolAwareResult?.usedProtocol
  };
};
