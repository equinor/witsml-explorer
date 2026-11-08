import { useEffect, useState } from "react";
import NotificationService, {
  JobProgress,
  JobProgressDetails
} from "services/notificationService";

export type { JobProgressDetails };

export const useLiveJobProgresses = (): JobProgress => {
  const [liveProgress, setLiveProgress] = useState<JobProgress>({});

  useEffect(() => {
    const unsubscribeOnJobProgress =
      NotificationService.Instance.jobProgressDispatcher.subscribe(
        (progressUpdates: JobProgress) => {
          setLiveProgress((prev) => {
            const next: JobProgress = { ...prev };
            for (const [id, update] of Object.entries(progressUpdates)) {
              const prevEntry =
                typeof prev[id] === "object"
                  ? (prev[id] as JobProgressDetails)
                  : undefined;
              const updateObj =
                typeof update === "object"
                  ? (update as JobProgressDetails)
                  : { progress: update };

              next[id] = {
                progress: updateObj.progress,
                currentStage: updateObj.currentStage ?? prevEntry?.currentStage,
                objectName: updateObj.objectName ?? prevEntry?.objectName,
                mnemonic: updateObj.mnemonic ?? prevEntry?.mnemonic,
                currentIndex: updateObj.currentIndex ?? prevEntry?.currentIndex,
                indexRange: updateObj.indexRange ?? prevEntry?.indexRange
              };
            }
            return next;
          });
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
  const entry = liveProgress[jobId];
  if (entry == null) return 0;
  return typeof entry === "number" ? entry : entry.progress;
};

export const useLiveJobProgressDetails = (
  jobId: string
): JobProgressDetails | undefined => {
  const liveProgress = useLiveJobProgresses();
  const entry = liveProgress[jobId];
  if (entry == null) return undefined;
  if (typeof entry === "number") {
    return { progress: entry };
  }
  return entry;
};
