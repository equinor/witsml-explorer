import JobStatus from "models/jobStatus";
import ReportType from "models/reportType";

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
  status: JobStatus;
  failedReason: string;
  progress: number;
  isCancelable: boolean;
  reportType: ReportType;
}
