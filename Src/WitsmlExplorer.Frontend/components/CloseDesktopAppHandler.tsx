import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetJobInfo } from "hooks/query/useGetJobInfo";
import JobStatus from "models/jobStatus";
import { ReactElement, useCallback, useEffect } from "react";

export function CloseDesktopAppHandler(): ReactElement {
  const { connectedServer } = useConnectedServer();
  const { jobInfos } = useGetJobInfo(false, {
    enabled: !!connectedServer,
    placeholderData: []
  });

  const listener = useCallback(() => {
    const unfinishedJobs = jobInfos.filter(
      (jobInfo) => jobInfo.status === JobStatus.Started
    );

    if (unfinishedJobs.length > 0) {
      // @ts-ignore
      window.electronAPI.closeWindowResponse(1);
    } else {
      // @ts-ignore
      window.electronAPI.closeWindowResponse(0);
    }
  }, [jobInfos]);

  useEffect(() => {
    // @ts-ignore
    window.electronAPI.onCloseWindow(listener);

    return () => {
      // @ts-ignore
      window.electronAPI.removeCloseWindow(listener);
    };
  }, [listener]);

  return null;
}
