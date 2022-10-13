import { CopyObjectsJob } from "./copyJobs";
import { DeleteObjectsJob } from "./deleteJobs";

export interface ReplaceLogObjectsJob {
  deleteJob: DeleteObjectsJob;
  copyJob: CopyObjectsJob;
}
