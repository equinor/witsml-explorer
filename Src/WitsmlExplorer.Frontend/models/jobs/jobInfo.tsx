import BaseReport from "models/reports/BaseReport";

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
  failedReason: string;
  report: BaseReport;
  progress: number;
  isCancelable: boolean;
  linkType: string;
}
