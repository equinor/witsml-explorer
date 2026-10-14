import { useQuery } from "@tanstack/react-query";
import { WitsmlProtocol } from "services/authorizationService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import WellboreService from "../../services/wellboreService";
import { QUERY_KEY_WELLBORE } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

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

export const wellboreQuery = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellboreQueryKey(server?.url, wellUid, wellboreUid),
  queryFn: () =>
    withQueryTiming(async () => {
      const wellbore = await WellboreService.getWellbore(
        wellUid,
        wellboreUid,
        null,
        server
      );
      return wellbore;
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
        } as TimedResponse<ProtocolAwareResponse<Wellbore>>),
  enabled:
    !!server && !!wellUid && !!wellboreUid && !(options?.enabled === false)
});

type WellboreQueryResult = {
  wellbore: Wellbore;
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): WellboreQueryResult => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<Wellbore>>
  >(wellboreQuery(server, wellUid, wellboreUid, options));

  const protocolAwareResult = timedResult?.data;
  const wellbore = protocolAwareResult?.data;

  return {
    wellbore,
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
