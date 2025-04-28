import { QUERY_KEY_UNIVERSAL_PRIORITIZED_CURVES } from "./queryKeys.tsx";
import { QueryOptions } from "./queryOptions.tsx";
import LogCurvePriorityService from "../../services/logCurvePriorityService.tsx";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";

export const getUniversalPrioritizedCurvesQueryKey = () => {
  return [QUERY_KEY_UNIVERSAL_PRIORITIZED_CURVES];
};

export const universalPrioritizedCurvesQuery = (options?: QueryOptions) => ({
  queryKey: getUniversalPrioritizedCurvesQueryKey(),
  queryFn: async () => {
    return await LogCurvePriorityService.getPrioritizedCurves(true);
  },
  ...options
});

type UniversalPrioritizedCurvesQueryResult = Omit<
  QueryObserverResult<string[], unknown>,
  "data"
> & {
  universalPrioritizedCurves: string[];
};

export const useGetUniversalPrioritizedCurves = (
  options?: QueryOptions
): UniversalPrioritizedCurvesQueryResult => {
  const { data, ...state } = useQuery<string[]>(
    universalPrioritizedCurvesQuery(options)
  );

  return { universalPrioritizedCurves: data, ...state };
};
