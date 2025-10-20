import { QUERY_KEY_LOCAL_PRIORITIZED_CURVES } from "./queryKeys.tsx";
import { QueryOptions } from "./queryOptions.tsx";
import LogCurvePriorityService from "../../services/logCurvePriorityService.tsx";
import {
  QueryObserverResult,
  useQueries,
  useQuery
} from "@tanstack/react-query";
import { Server } from "../../models/server.ts";

export const getLocalPrioritizedCurvesQueryKey = (
  wellUid: string,
  wellboreUid: string
) => {
  return [
    QUERY_KEY_LOCAL_PRIORITIZED_CURVES,
    wellUid.toLowerCase(),
    wellboreUid.toLowerCase()
  ];
};

export const localPrioritizedCurvesQuery = (
  wellUid: string,
  wellboreUid: string,
  server?: Server,
  options?: QueryOptions
) => ({
  queryKey: getLocalPrioritizedCurvesQueryKey(wellUid, wellboreUid),
  queryFn: async () => {
    return await LogCurvePriorityService.getPrioritizedCurves(
      false,
      wellUid,
      wellboreUid,
      server
    );
  },
  ...options
});

export const multipleLocalPrioritizedCurvesQuery = (
  wellUid: string,
  wellboreUid: string,
  server?: Server
) => ({
  queryKey: getLocalPrioritizedCurvesQueryKey(wellUid, wellboreUid),
  queryFn: async () => {
    return await LogCurvePriorityService.getPrioritizedCurves(
      false,
      wellUid,
      wellboreUid,
      server
    );
  }
});

type LocalPrioritizedCurvesQueryResult = Omit<
  QueryObserverResult<string[], unknown>,
  "data"
> & {
  localPrioritizedCurves: string[];
};

export const useGetLocalPrioritizedCurves = (
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions,
  server?: Server
): LocalPrioritizedCurvesQueryResult => {
  const { data, ...state } = useQuery<string[]>(
    localPrioritizedCurvesQuery(wellUid, wellboreUid, server, options)
  );

  return { localPrioritizedCurves: data, ...state };
};

//todo: fix types
export const useGetMultipleLocalPrioritizedCurves = (
  wellComplexIds: { wellUid: string; wellboreUid: string; server?: Server }[]
): { objects: string[]; isFetching: boolean }[] => {
  const result = useQueries<string[]>({
    queries: wellComplexIds.map(({ wellUid, wellboreUid, server }) =>
      multipleLocalPrioritizedCurvesQuery(wellUid, wellboreUid, server)
    )
  });

  return result.map((r) => {
    return { objects: r.data as string[], isFetching: r.isFetching };
  });
};
