import { QUERY_KEY_LOCAL_PRIORITIZED_CURVES } from "./queryKeys.tsx";
import { QueryOptions } from "./queryOptions.tsx";
import LogCurvePriorityService from "../../services/logCurvePriorityService.tsx";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";

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
