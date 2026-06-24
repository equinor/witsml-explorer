import { useQuery } from "@tanstack/react-query";
import { WitsmlProtocol } from "services/authorizationService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import WellboreService from "../../services/wellboreService";
import { QUERY_KEY_WELLBORES } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

export const getWellboresQueryKey = (serverUrl: string, wellUid: string) => {
  return [
    QUERY_KEY_WELLBORES,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase()
  ];
};

export const wellboresQuery = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
) => ({
  queryKey: getWellboresQueryKey(server?.url, wellUid),
  queryFn: () =>
    withQueryTiming(async () => {
      const wellbores = await WellboreService.getWellbores(
        wellUid,
        null,
        server
      );
      return wellbores;
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
        } as TimedResponse<ProtocolAwareResponse<Wellbore[]>>),
  enabled: !!server && wellUid != null && !(options?.enabled === false)
});

type WellboresQueryResult = {
  wellbores: Wellbore[];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetWellbores = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellboresQueryResult => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<Wellbore[]>>
  >(wellboresQuery(server, wellUid, options));

  const protocolAwareResult = timedResult?.data;
  const wellbores = protocolAwareResult?.data;

  return {
    wellbores: wellbores,
    responseTime: timedResult?.responseTime,
    usedProtocol: protocolAwareResult?.usedProtocol,
    ...state
  };
};
