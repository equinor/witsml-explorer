import JobService, {
  JobType as JobJobType
} from "../../services/jobService.tsx";
import JobStatus from "../../models/jobStatus.ts";
import { toDate } from "date-fns-tz";

export const IsQcReportJobRunning = async (logName: string) => {
  const jobInfos = await JobService.getUserJobInfos();

  for (const jobInfo of jobInfos) {
    if (
      jobInfo.jobType == JobJobType.MinimumDataQc + "Job" &&
      jobInfo.status == JobStatus.Started &&
      jobInfo.objectName === logName
    ) {
      return true;
    }
  }

  return false;
};

export const LoadExistingMinQcReport = async (
  logName: string,
  timeout?: number
) => {
  const jobInfos = await JobService.getUserJobInfos();

  if (!!jobInfos && jobInfos.length > 0) {
    const filteredJobInfos = jobInfos
      .filter(
        (ji) =>
          ji.jobType == JobJobType.MinimumDataQc + "Job" &&
          ji.status == JobStatus.Finished &&
          ji.objectName === logName &&
          !!ji.endTime &&
          Date.now() - toDate(ji.endTime).getTime() < (timeout ?? 8) * 3600000
      )
      .sort(
        (a, b) => toDate(b.endTime).getTime() - toDate(a.endTime).getTime()
      );

    if (!!filteredJobInfos && filteredJobInfos.length > 0) {
      return await JobService.getReport(filteredJobInfos[0].id);
    }
  }

  return undefined;
};
