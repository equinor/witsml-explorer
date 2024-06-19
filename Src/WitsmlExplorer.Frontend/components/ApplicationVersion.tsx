import { EdsProvider, Typography } from "@equinor/eds-core-react";
import { Button } from "components/StyledComponents/Button";
import { UserTheme } from "contexts/operationStateReducer";
import { useOperationState } from "hooks/useOperationState";
import JobStatus from "models/jobStatus";
import { useCallback, useEffect, useState } from "react";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";
import styled from "styled-components";
import Icon from "styles/Icons";

export function WebVersion() {
  const version = import.meta.env.VITE_WEX_VERSION;
  return (
    version && (
      <Typography
        token={{
          fontFamily: "Equinor"
        }}
      >
        v.{version}
      </Typography>
    )
  );
}

export function DesktopVersion() {
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    const getDesktopVersion = async () => {
      // @ts-ignore
      const appVersion = await window.electronAPI.getAppVersion();
      setVersion(appVersion);
    };
    getDesktopVersion();
  }, []);

  return (
    <DesktopVersionContainer>
      <DesktopUpdateStatus />
      <Typography
        token={{
          fontFamily: "Equinor"
        }}
      >
        v.{version}
      </Typography>
    </DesktopVersionContainer>
  );
}

interface UpdateStatus {
  status: string;
  updateInfo: any;
}

function DesktopUpdateStatus() {
  const {
    operationState: { colors }
  } = useOperationState();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      // @ts-ignore
      await window.electronAPI.checkForUpdates();
    };
    checkForUpdates();
  }, []);

  const onUpdateStatusListener = useCallback((updateStatus: UpdateStatus) => {
    setUpdateStatus(updateStatus);
  }, []);

  useEffect(() => {
    // @ts-ignore
    window.electronAPI.onUpdateStatus(onUpdateStatusListener);

    return () => {
      // @ts-ignore
      window.electronAPI.removeUpdateStatusListener(onUpdateStatusListener);
    };
  }, []);

  const handleDownloadUpdate = async () => {
    // @ts-ignore
    await window.electronAPI.downloadUpdate();
  };

  const handleQuitAndInstall = async () => {
    const jobInfos = await JobService.getAllJobInfos();

    const unfinishedJobs = jobInfos.filter(
      (jobInfo) => jobInfo.status === JobStatus.Started
    );

    if (unfinishedJobs.length > 0) {
      // @ts-ignore
      window.electronAPI.quitAndInstallUpdate(true);
    } else {
      // @ts-ignore
      window.electronAPI.quitAndInstallUpdate(false);
    }
  };

  if (updateStatus?.status === "update-available") {
    return (
      <>
        <Icon
          name="newAlert"
          size={24}
          color={colors.interactive.warningResting}
        />
        <Typography
          token={{
            fontFamily: "Equinor"
          }}
        >
          An update is available, download it here:
        </Typography>
        <EdsProvider density={UserTheme.Compact}>
          <Button
            variant="ghost_icon"
            key="download_update"
            aria-label="download update"
            onClick={handleDownloadUpdate}
          >
            <Icon name="download" size={18} />
          </Button>
        </EdsProvider>
      </>
    );
  } else if (updateStatus?.status === "update-not-available") {
    return (
      <Typography
        token={{
          fontFamily: "Equinor"
        }}
      >
        Up to date:
      </Typography>
    );
  } else if (updateStatus?.status === "checking-for-update") {
    return (
      <Typography
        token={{
          fontFamily: "Equinor"
        }}
      >
        Checking for updates...
      </Typography>
    );
  } else if (updateStatus?.status === "update-downloaded") {
    return (
      <>
        <Icon
          name="newAlert"
          size={24}
          color={colors.interactive.warningResting}
        />
        <Typography
          token={{
            fontFamily: "Equinor"
          }}
        >
          The update has finished downloading. Click here to quit and install:
        </Typography>
        <EdsProvider density={UserTheme.Compact}>
          <Button
            variant="ghost_icon"
            key="download_update"
            aria-label="download update"
            onClick={handleQuitAndInstall}
          >
            <Icon name="update" size={18} />
          </Button>
        </EdsProvider>
      </>
    );
  } else if (updateStatus?.status === "error") {
    if (updateStatus?.updateInfo?.message) {
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: null,
        message: `There was an error while checking for updates: ${updateStatus?.updateInfo?.message}`,
        isSuccess: false
      });
    }
    return null;
  } else if (updateStatus?.status === "download-progress") {
    return (
      <>
        <Icon
          name="newAlert"
          size={24}
          color={colors.interactive.warningResting}
        />
        <Typography
          token={{
            fontFamily: "Equinor"
          }}
        >
          Downloading updates... {updateStatus?.updateInfo?.percent.toFixed(0)}%
        </Typography>
      </>
    );
  }

  return null;
}

const DesktopVersionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
