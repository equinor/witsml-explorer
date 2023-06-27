import { Button, Icon, Switch, Typography } from "@equinor/eds-core-react";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import JobInfo from "../../models/jobs/jobInfo";
import { Server } from "../../models/server";
import { adminRole, developerRole, getUserAppRoles, msalEnabled } from "../../msal/MsalAuthProvider";
import JobService from "../../services/jobService";
import NotificationService, { Notification } from "../../services/notificationService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import JobInfoContextMenu, { JobInfoContextMenuProps } from "../ContextMenus/JobInfoContextMenu";
import formatDateString from "../DateFormatter";
import { clipLongString } from "./ViewUtils";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const JobsView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    dispatchOperation,
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { servers, selectedServer } = navigationState;
  const [jobInfos, setJobInfos] = useState<JobInfo[]>([]);
  const [lastFetched, setLastFetched] = useState<string>(new Date().toLocaleTimeString());
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(true);
  const [showAll, setShowAll] = useState(false);

  const fetchJobs = () => {
    const abortController = new AbortController();
    const getJobInfos = async () => {
      const jobInfos = showAll ? JobService.getAllJobInfos(abortController.signal) : JobService.getUserJobInfos(abortController.signal);
      setJobInfos(await jobInfos);
      setLastFetched(new Date().toLocaleTimeString());
    };

    getJobInfos();

    return function cleanup() {
      abortController.abort();
    };
  };

  useEffect(() => {
    const eventHandler = (notification: Notification) => {
      const shouldFetch = notification.serverUrl.toString() === navigationState.selectedServer?.url;
      if (shouldFetch) {
        setShouldRefresh(true);
      }
    };
    const unsubscribeOnSnackbar = NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(eventHandler);
    const unsubscribeOnAlert = NotificationService.Instance.alertDispatcherAsEvent.subscribe(eventHandler);

    return function cleanup() {
      unsubscribeOnSnackbar();
      unsubscribeOnAlert();
    };
  }, [navigationState.selectedServer]);

  useEffect(() => {
    return setShouldRefresh(true);
  }, [showAll, selectedServer]);

  useEffect(() => {
    if (shouldRefresh) {
      setShouldRefresh(false);
      fetchJobs();
    }
  }, [shouldRefresh]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, selectedItem: any) => {
    const contextMenuProps: JobInfoContextMenuProps = {
      dispatchOperation,
      jobInfo: selectedItem.jobInfo,
      setShouldRefresh
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <JobInfoContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "startTime", label: "Start time", type: ContentType.DateTime },
    { property: "jobType", label: "Job Type", type: ContentType.String },
    { property: "wellName", label: "Well Name", type: ContentType.String },
    { property: "wellboreName", label: "Wellbore Name", type: ContentType.String },
    { property: "objectName", label: "Object Name(s)", type: ContentType.String },
    { property: "status", label: "Status", type: ContentType.String },
    { property: "failedReason", label: "Failure Reason", type: ContentType.String },
    { property: "targetServer", label: "Target Server", type: ContentType.String },
    { property: "sourceServer", label: "Source Server", type: ContentType.String },
    { property: "endTime", label: "Finish time", type: ContentType.DateTime },
    { property: "username", label: "Ordered by", type: ContentType.String }
  ];

  const jobInfoRows = jobInfos.map((jobInfo) => {
    return {
      ...jobInfo,
      failedReason: clipLongString(jobInfo.failedReason, 20, "-"),
      wellName: clipLongString(jobInfo.wellName, 20, "-"),
      wellboreName: clipLongString(jobInfo.wellboreName, 20, "-"),
      objectName: clipLongString(jobInfo.objectName, 30, "-"),
      startTime: formatDateString(jobInfo.startTime, timeZone),
      endTime: formatDateString(jobInfo.endTime, timeZone),
      targetServer: serverUrlToName(servers, jobInfo.targetServer),
      sourceServer: serverUrlToName(servers, jobInfo.sourceServer),
      jobInfo: jobInfo
    };
  });

  const panelElements = [
    <Button
      key="refreshJobs"
      variant="outlined"
      aria-disabled={shouldRefresh ? true : false}
      aria-label={shouldRefresh ? "loading data" : null}
      onClick={shouldRefresh ? undefined : () => setShouldRefresh(true)}
      disabled={shouldRefresh}
    >
      <Icon name="refresh" />
      Refresh
    </Button>,
    msalEnabled && (getUserAppRoles().includes(adminRole) || getUserAppRoles().includes(developerRole)) ? (
      <Switch
        key="showAllUsersJobs"
        label="Show all users' jobs"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setShowAll(e.target.checked);
        }}
      />
    ) : null,
    <Typography key="lastFetched">Last fetched: {lastFetched}</Typography>
  ];

  return <ContentTable viewId="jobsView" columns={columns} data={jobInfoRows} onContextMenu={onContextMenu} panelElements={panelElements} />;
};

const serverUrlToName = (servers: Server[], url: string): string => {
  if (!url) {
    return "-";
  }
  const server = servers.find((server) => server.url == url);
  return server ? server.name : url;
};

export default JobsView;
