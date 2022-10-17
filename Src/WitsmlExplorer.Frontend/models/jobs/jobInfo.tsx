export default interface JobInfo {
  jobType: string;
  description: string;
  id: string;
  username: string;
  witsmlUsername: string;
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
}
