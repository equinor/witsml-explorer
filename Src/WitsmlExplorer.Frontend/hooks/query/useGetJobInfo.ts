import {
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { QUERY_KEY_JOB_INFO } from "hooks/query/queryKeys";
import { refreshJobInfoQuery } from "hooks/query/queryRefreshHelpers";
import { useLiveJobProgresses } from "hooks/useLiveJobProgress";
import JobInfo from "models/jobs/jobInfo";
import { useEffect } from "react";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";
import { QueryOptions } from "./queryOptions";

export const getJobInfoQueryKey = (all: boolean) => {
  return [QUERY_KEY_JOB_INFO, all];
};

export const jobInfoQuery = (all: boolean, options?: QueryOptions) => ({
  queryKey: getJobInfoQueryKey(all),
  queryFn: async () => {
    const jobInfos = all
      ? await JobService.getAllJobInfos()
      : await JobService.getUserJobInfos();
    return jobInfos;
  },
  ...options,
  gcTime: 0 // We don't want to keep jobs in cache when it's not used.
});

type JobInfoQueryResult = Omit<
  QueryObserverResult<JobInfo[], unknown>,
  "data"
> & {
  jobInfos: JobInfo[];
};

export const useGetJobInfo = (
  all: boolean,
  options?: QueryOptions
): JobInfoQueryResult => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<JobInfo[]>(jobInfoQuery(all, options));
  const liveProgress = useLiveJobProgresses();

  useEffect(() => {
    const notificationHandler = () => {
      refreshJobInfoQuery(queryClient);
    };

    const unsubscribeOnSnackbar =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        notificationHandler
      );

    const unsubscribeOnAlert =
      NotificationService.Instance.alertDispatcherAsEvent.subscribe(
        notificationHandler
      );

    return function cleanup() {
      unsubscribeOnSnackbar();
      unsubscribeOnAlert();
    };
  }, [queryClient]);

  const updatedJobInfos = data?.map((jobInfo) => {
    return {
      ...jobInfo,
      progress: Math.max(liveProgress[jobInfo.id] ?? 0, jobInfo.progress ?? 0)
    };
  });

  return { jobInfos: updatedJobInfos, ...state };
};
