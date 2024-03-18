import { Icon, Switch, Typography } from "@equinor/eds-core-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { refreshJobInfoQuery } from "hooks/query/queryRefreshHelpers";
import { useGetJobInfo } from "hooks/query/useGetJobInfo";
import { useGetServers } from "hooks/query/useGetServers";
import BaseReport from "models/reports/BaseReport";
import { Server } from "models/server";
import {
  adminRole,
  developerRole,
  getUserAppRoles,
  msalEnabled
} from "msal/MsalAuthProvider";
import React, { ChangeEvent, useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const JobsView = (): React.ReactElement => {
  const {
    dispatchOperation,
    operationState: { timeZone, colors, dateTimeFormat }
  } = useContext(OperationContext);
  const queryClient = useQueryClient();
  const { servers } = useGetServers();
  const [showAll, setShowAll] = useState(false);
  const { jobInfos, isFetching, dataUpdatedAt } = useGetJobInfo(showAll, {
    placeholderData: []
  });
  const lastFetched = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "";

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    selectedItem: any
  ) => {
    const contextMenuProps: JobInfoContextMenuProps = {
      dispatchOperation,
      jobInfo: selectedItem.jobInfo
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
            status:
              jobInfo.progress && jobInfo.status === "Started"
                ? `${Math.round(jobInfo.progress * 100)}%`
                : jobInfo.status,
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
      variant="ghost_icon"
      key="refreshJobs"
      aria-disabled={isFetching ? true : false}
      aria-label={isFetching ? "loading data" : null}
      onClick={isFetching ? undefined : () => refreshJobInfoQuery(queryClient)}
      disabled={isFetching}
    >
      <Icon name="refresh" />
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
          refreshJobInfoQuery(queryClient);
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
