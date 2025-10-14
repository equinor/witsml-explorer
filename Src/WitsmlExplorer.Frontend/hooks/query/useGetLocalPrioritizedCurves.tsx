import { QUERY_KEY_LOCAL_PRIORITIZED_CURVES } from "./queryKeys.tsx";
import { QueryOptions } from "./queryOptions.tsx";
import LogCurvePriorityService from "../../services/logCurvePriorityService.tsx";
import {
  QueryObserverResult,
  useQueries,
  useQuery
} from "@tanstack/react-query";

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
  options?: QueryOptions
) => ({
  queryKey: getLocalPrioritizedCurvesQueryKey(wellUid, wellboreUid),
  queryFn: async () => {
    return await LogCurvePriorityService.getPrioritizedCurves(
      false,
      wellUid,
      wellboreUid
    );
  },
  ...options
});

export const multipleLocalPrioritizedCurvesQuery = (
  wellUid: string,
  wellboreUid: string
) => ({
  queryKey: getLocalPrioritizedCurvesQueryKey(wellUid, wellboreUid),
  queryFn: async () => {
    return await LogCurvePriorityService.getPrioritizedCurves(
      false,
      wellUid,
      wellboreUid
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
  options?: QueryOptions
): LocalPrioritizedCurvesQueryResult => {
  const { data, ...state } = useQuery<string[]>(
    localPrioritizedCurvesQuery(wellUid, wellboreUid, options)
  );

  return { localPrioritizedCurves: data, ...state };
};

//todo: fix types
export const useGetMultipleLocalPrioritizedCurves = (
  wellComplexIds: { wellUid: string; wellboreUid: string }[]
): { objects: string[]; isFetching: boolean }[] => {
  const result = useQueries<string[]>({
    queries: wellComplexIds.map(({ wellUid, wellboreUid }) =>
      multipleLocalPrioritizedCurvesQuery(wellUid, wellboreUid)
    )
  });

  return result.map((r) => {
    return { objects: r.data as string[], isFetching: r.isFetching };
  });
};
