export default interface JobInfo {
  jobType: string;
  description: string;
  id: string;
  username: string;
  sourceServer: string;
  targetServer: string;
  startTime: string;
  endTime: string;
  killTime: string;
  status: string;
  failedReason: string;
}
