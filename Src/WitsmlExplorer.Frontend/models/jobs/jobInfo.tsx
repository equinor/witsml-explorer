export default interface JobInfo {
  jobType: string;
  description: string;
  id: string;
  username: string;
  witsmlUsername: string;
  sourceServer: string;
  targetServer: string;
  startTime: string;
  endTime: string;
  killTime: string;
  status: string;
  failedReason: string;
}
