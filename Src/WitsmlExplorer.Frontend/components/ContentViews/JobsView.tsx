import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import JobInfo from "../../models/jobs/jobInfo";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import JobService from "../../services/jobService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import JobInfoContextMenu, { JobInfoContextMenuProps } from "../ContextMenus/JobInfoContextMenu";
import { ContentTable, ContentTableColumn, ContentType, Order } from "./table";

export const JobsView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedServer, servers } = navigationState;
  const [jobInfos, setJobInfos] = useState<JobInfo[]>([]);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  const credentials = CredentialsService.getCredentials();
  const username = credentials.find((creds) => creds.server.id == selectedServer.id)?.username;
  useEffect(() => {
    setIsFetchingData(true);
    if (username) {
      const abortController = new AbortController();
      const getJobInfos = async () => {
        setJobInfos(await JobService.getJobInfos(username, abortController.signal));
        setIsFetchingData(false);
      };

      getJobInfos();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [username]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, selectedItem: any) => {
    const contextMenuProps: JobInfoContextMenuProps = {
      dispatchOperation,
      jobInfo: selectedItem.jobInfo
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <JobInfoContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "startTime", label: "Start time", type: ContentType.String },
    { property: "jobType", label: "Job Type", type: ContentType.String },
    { property: "status", label: "Status", type: ContentType.String },
    { property: "description", label: "Description", type: ContentType.String },
    { property: "failedReason", label: "Failure Reason", type: ContentType.String },
    { property: "targetServer", label: "Target Server", type: ContentType.String },
    { property: "sourceServer", label: "Source Server", type: ContentType.String },
    { property: "endTime", label: "Finish time", type: ContentType.String },
    { property: "killTime", label: "Expiration time", type: ContentType.String },
    { property: "id", label: "Job ID", type: ContentType.String },
    { property: "username", label: "Ordered by", type: ContentType.String }
  ];

  const jobInfoRows = jobInfos.map((jobInfo) => {
    return {
      ...jobInfo,
      description: clipLongString(jobInfo.description, 25),
      failedReason: clipLongString(jobInfo.failedReason, 20),
      startTime: jobInfo.startTime ? new Date(jobInfo.startTime).toLocaleString() : "-",
      endTime: jobInfo.endTime ? new Date(jobInfo.endTime).toLocaleString() : "-",
      killTime: jobInfo.killTime ? new Date(jobInfo.killTime).toLocaleString() : "-",
      targetServer: serverUrlToName(servers, jobInfo.targetServer),
      sourceServer: serverUrlToName(servers, jobInfo.sourceServer),
      jobInfo: jobInfo
    };
  });

  return !isFetchingData ? <ContentTable columns={columns} data={jobInfoRows} order={Order.Descending} onContextMenu={onContextMenu} /> : <></>;
};

const clipLongString = (toClip: string, length: number): string => {
  if (!toClip) {
    return "-";
  }
  return toClip.length > length ? `${toClip.substring(0, length).trim()}…` : toClip;
};

const serverUrlToName = (servers: Server[], url: string): string => {
  if (!url) {
    return "-";
  }
  const server = servers.find((server) => server.url == url);
  return server ? server.name : "-";
};

export default JobsView;
