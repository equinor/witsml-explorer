import { useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import WellboreService from "../../services/wellboreService";
import { QUERY_KEY_WELLBORE } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import {
  TimedResponse,
  withQueryTiming,
  wrapPlaceholderData
} from "./queryTiming";

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
  placeholderData: wrapPlaceholderData(options?.placeholderData),
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
};

export const useGetWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): WellboreQueryResult => {
  const { data, ...state } = useQuery<TimedResponse<Wellbore>>(
    wellboreQuery(server, wellUid, wellboreUid, options)
  );
  return {
    wellbore: data?.data,
    responseTime: data?.responseTime,
    error: state.error,
    isError: state.isError,
    isLoading: state.isLoading,
    isFetching: state.isFetching,
    isFetched: state.isFetched,
    dataUpdatedAt: state.dataUpdatedAt
  };
};
