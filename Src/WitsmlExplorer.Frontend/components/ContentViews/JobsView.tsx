import { Icon, Switch, Typography } from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import JobInfoContextMenu, {
  JobInfoContextMenuProps
} from "components/ContextMenus/JobInfoContextMenu";
import formatDateString from "components/DateFormatter";
import { ReportModal } from "components/Modals/ReportModal";
import { Button } from "components/StyledComponents/Button";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import JobInfo from "models/jobs/jobInfo";
import BaseReport from "models/reports/BaseReport";
import { Server } from "models/server";
import {
  adminRole,
  developerRole,
  getUserAppRoles,
  msalEnabled
} from "msal/MsalAuthProvider";
import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useParams } from "react-router-dom";
import JobService from "services/jobService";
import NotificationService, {
  Notification
} from "services/notificationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const JobsView = (): React.ReactElement => {
  const {
    dispatchOperation,
    operationState: { timeZone, colors, dateTimeFormat }
  } = useContext(OperationContext);
  const { serverUrl } = useParams();
  const { servers } = useGetServers();
  const [jobInfos, setJobInfos] = useState<JobInfo[]>([]);
  const [lastFetched, setLastFetched] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(true);
  const [showAll, setShowAll] = useState(false);

  const fetchJobs = () => {
    const abortController = new AbortController();
    const getJobInfos = async () => {
      const jobInfos = showAll
        ? JobService.getAllJobInfos(abortController.signal)
        : JobService.getUserJobInfos(abortController.signal);
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
      const shouldFetch =
        notification.serverUrl.toString().toLowerCase() ===
        serverUrl?.toLowerCase();
      if (shouldFetch) {
        setShouldRefresh(true);
      }
    };
    const unsubscribeOnSnackbar =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        eventHandler
      );
    const unsubscribeOnAlert =
      NotificationService.Instance.alertDispatcherAsEvent.subscribe(
        eventHandler
      );

    return function cleanup() {
      unsubscribeOnSnackbar();
      unsubscribeOnAlert();
    };
  }, [serverUrl]);

  useEffect(() => {
    return setShouldRefresh(true);
  }, [showAll, serverUrl]);

  useEffect(() => {
    if (shouldRefresh) {
      setShouldRefresh(false);
      fetchJobs();
    }
  }, [shouldRefresh]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    selectedItem: any
  ) => {
    const contextMenuProps: JobInfoContextMenuProps = {
      dispatchOperation,
      jobInfo: selectedItem.jobInfo,
      setShouldRefresh
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <JobInfoContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onClickReport = (report: BaseReport) => {
    const reportModalProps = { report };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ReportModal {...reportModalProps} />
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "startTime", label: "Start time", type: ContentType.DateTime },
    { property: "jobType", label: "Job Type", type: ContentType.String },
    { property: "wellName", label: "Well Name", type: ContentType.String },
    {
      property: "wellboreName",
      label: "Wellbore Name",
      type: ContentType.String
    },
    {
      property: "objectName",
      label: "Object Name(s)",
      type: ContentType.String
    },
    { property: "status", label: "Status", type: ContentType.String },
    { property: "report", label: "Report", type: ContentType.Component },
    {
      property: "failedReason",
      label: "Failure Reason",
      type: ContentType.String
    },
    {
      property: "targetServer",
      label: "Target Server",
      type: ContentType.String
    },
    {
      property: "sourceServer",
      label: "Source Server",
      type: ContentType.String
    },
    { property: "endTime", label: "Finish time", type: ContentType.DateTime },
    { property: "username", label: "Ordered by", type: ContentType.String }
  ];

  const jobInfoRows = useMemo(
    () =>
      jobInfos
        .map((jobInfo) => {
          return {
            ...jobInfo,
            failedReason: jobInfo.failedReason,
            wellName: jobInfo.wellName,
            wellboreName: jobInfo.wellboreName,
            objectName: jobInfo.objectName,
            startTime: formatDateString(
              jobInfo.startTime,
              timeZone,
              dateTimeFormat
            ),
            endTime: formatDateString(
              jobInfo.endTime,
              timeZone,
              dateTimeFormat
            ),
            targetServer: serverUrlToName(servers, jobInfo.targetServer),
            sourceServer: serverUrlToName(servers, jobInfo.sourceServer),
            report: jobInfo.report ? (
              <ReportButton onClick={() => onClickReport(jobInfo.report)}>
                Report
              </ReportButton>
            ) : null,
            jobInfo: jobInfo
          };
        })
        .sort((obj1, obj2) => {
          return obj2.startTime.localeCompare(obj1.startTime);
        }),
    [jobInfos]
  );

  const panelElements = [
    <Button
      key="refreshJobs"
      aria-disabled={shouldRefresh ? true : false}
      aria-label={shouldRefresh ? "loading data" : null}
      onClick={shouldRefresh ? undefined : () => setShouldRefresh(true)}
      disabled={shouldRefresh}
    >
      <Icon name="refresh" />
      Refresh
    </Button>,
    msalEnabled &&
    (getUserAppRoles().includes(adminRole) ||
      getUserAppRoles().includes(developerRole)) ? (
      <StyledSwitch
        colors={colors}
        key="showAllUsersJobs"
        label="Show all users' jobs"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setShowAll(e.target.checked);
        }}
      />
    ) : null,
    <Typography key="lastFetched">Last fetched: {lastFetched}</Typography>
  ];

  return (
    <ContentTable
      viewId="jobsView"
      columns={columns}
      data={jobInfoRows}
      onContextMenu={onContextMenu}
      panelElements={panelElements}
      downloadToCsvFileName="Jobs"
    />
  );
};

const serverUrlToName = (servers: Server[], url: string): string => {
  if (!url) {
    return "-";
  }
  const server = servers.find(
    (server) => server.url.toLowerCase() == url.toLowerCase()
  );
  return server ? server.name : url;
};

const StyledSwitch = styled(Switch)<{ colors: Colors }>`
  span {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
    margin-left: 0;
  }
`;
const ReportButton = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;

export default JobsView;
