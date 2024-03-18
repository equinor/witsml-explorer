import { useEffect, useState } from "react";
import NotificationService, { JobProgress } from "services/notificationService";

export const useLiveJobProgresses = (): JobProgress => {
  const [liveProgress, setLiveProgress] = useState<JobProgress>({});

  useEffect(() => {
    const unsubscribeOnJobProgress =
      NotificationService.Instance.jobProgressDispatcher.subscribe(
        (progressUpdates: JobProgress) => {
          setLiveProgress((progress) => ({
            ...progress,
            ...progressUpdates
          }));
        }
      );

    return function cleanup() {
      unsubscribeOnJobProgress();
    };
  }, []);

  return liveProgress;
};

export const useLiveJobProgress = (jobId: string): number => {
  const liveProgress = useLiveJobProgresses();
  return liveProgress[jobId] || 0;
};
