import {
  //QueryClient,
  QueryObserverResult,
  useQuery,
  //useQueryClient
} from "@tanstack/react-query";
//import { Server } from "../../models/server";
//import Wellbore from "../../models/wellbore";
//import WellboreService from "../../services/wellboreService";
import { QUERY_KEY_MNEMONICS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
//import { getWellboreQueryKey } from "./useGetWellbore";
import LogObjectService from "services/logObjectService";
import LogCurveInfo from "models/logCurveInfo";

export const getMnemonicsQueryKey = (wellUid: string, wellboreUid: string, logsSearchParams: string[]) => {
  return [
    QUERY_KEY_MNEMONICS,
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase(),
    logsSearchParams.toString().toLowerCase()
  ];
};



export const mnemonicsQuery = (
  // queryClient: QueryClient,
  wellUid: string,
  wellboreUid: string,
  logsSearchParams: string[],
  options?: QueryOptions
) => ({
  queryKey: getMnemonicsQueryKey(wellUid, wellboreUid, logsSearchParams),
  queryFn: async () => {
    const mnemonics = await LogObjectService.getMnemonicsInLogs(
      wellUid,
      wellboreUid,
      logsSearchParams,
      new AbortController().signal
    );
    // updateIndividualWellbores(queryClient, server, wellbores);
    return mnemonics;
  },
  ...options,
  enabled: !!wellboreUid && !!wellUid && !(options?.enabled === false)
});

type MnemonicsQueryResult = Omit<
  QueryObserverResult<LogCurveInfo[], unknown>,
  "data"
> & {
  mnemonics: LogCurveInfo[];
};

export const useGetSeveralLogsMnemonics = (
  wellUid: string,
  wellboreUid: string,
  logsSearchParams: string[],
  options?: QueryOptions
): MnemonicsQueryResult => {
  // const queryClient = useQueryClient();
  const { data, ...state } = useQuery<LogCurveInfo[]>(
    mnemonicsQuery(wellUid, wellboreUid, logsSearchParams, options)
  );
  return { mnemonics: data, ...state };
};
