import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType, Order } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import CredentialsService from "../../services/credentialsService";
import JobInfo from "../../models/jobs/jobInfo";
import JobService from "../../services/jobService";
import { Server } from "../../models/server";

export const JobsView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
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

  const columns: ContentTableColumn[] = [
    { property: "startTime", label: "Start time", type: ContentType.String },
    { property: "jobType", label: "Job Type", type: ContentType.String },
    { property: "status", label: "Status", type: ContentType.String },
    { property: "description", label: "Description", type: ContentType.String },
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
      description: jobInfo.description.length > 90 ? `${jobInfo.description.substring(0, 50)}...` : jobInfo.description,
      startTime: jobInfo.startTime ? new Date(jobInfo.startTime).toLocaleString() : "-",
      endTime: jobInfo.endTime ? new Date(jobInfo.endTime).toLocaleString() : "-",
      killTime: jobInfo.killTime ? new Date(jobInfo.killTime).toLocaleString() : "-",
      targetServer: serverUrlToName(servers, jobInfo.targetServer),
      sourceServer: serverUrlToName(servers, jobInfo.sourceServer)
    };
  });

  return !isFetchingData ? <ContentTable columns={columns} data={jobInfoRows} order={Order.Descending} /> : <></>;
};

const serverUrlToName = (servers: Server[], url: string): string => {
  if (!url) {
    return "-";
  }
  const server = servers.find((server) => server.url == url);
  return server ? server.name : server.url;
};

export default JobsView;
