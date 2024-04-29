import JobStatus from "models/jobStatus";
import { ReactElement, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobService from "services/jobService";

export function DesktopAppEventHandler(): ReactElement {
  const navigate = useNavigate();

  const onCloseWindowListener = useCallback(async () => {
    const jobInfos = await JobService.getAllJobInfos();

    const unfinishedJobs = jobInfos.filter(
      (jobInfo) => jobInfo.status === JobStatus.Started
    );

    if (unfinishedJobs.length > 0) {
      // @ts-ignore
      window.electronAPI.closeWindowResponse(true);
    } else {
      // @ts-ignore
      window.electronAPI.closeWindowResponse(false);
    }
  }, []);

  useEffect(() => {
    // @ts-ignore
    window.electronAPI.onCloseWindow(onCloseWindowListener);

    return () => {
      // @ts-ignore
      window.electronAPI.removeCloseWindowListener(onCloseWindowListener);
    };
  }, [onCloseWindowListener]);

  const onNavigateListener = useCallback((route: string) => {
    navigate(route);
  }, []);

  useEffect(() => {
    // @ts-ignore
    window.electronAPI.onNavigate(onNavigateListener);

    return () => {
      // @ts-ignore
      window.electronAPI.removeNavigateListener(onNavigateListener);
    };
  }, [onNavigateListener]);

  return null;
}
