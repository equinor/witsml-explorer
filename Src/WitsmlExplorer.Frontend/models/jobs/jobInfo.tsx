import BaseReport from "../reports/BaseReport";

export default interface JobInfo {
  jobType: string;
  description: string;
  id: string;
  username: string;
  witsmlTargetUsername: string;
  witsmlSourceUsername: string;
  sourceServer: string;
  targetServer: string;
  wellName: string;
  wellboreName: string;
  objectName: string;
  startTime: string;
  endTime: string;
  killTime: string;
  status: string;
  progress: number;
  failedReason: string;
  report: BaseReport;
}

export enum JobStatus {
  Started = "Started",
  Finished = "Finished",
  Failed = "Failed"
}
