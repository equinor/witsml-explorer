import { CopyObjectsJob } from "models/jobs/copyJobs";
import { DeleteObjectsJob } from "models/jobs/deleteJobs";

export interface ReplaceObjectsJob {
  deleteJob: DeleteObjectsJob;
  copyJob: CopyObjectsJob;
}
