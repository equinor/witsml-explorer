import { CopyComponentsJob } from "models/jobs/copyJobs";
import { DeleteComponentsJob } from "models/jobs/deleteJobs";

export interface ReplaceComponentsJob {
  deleteJob: DeleteComponentsJob;
  copyJob: CopyComponentsJob;
}
