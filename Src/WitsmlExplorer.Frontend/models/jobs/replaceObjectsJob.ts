import { CopyObjectsJob } from "./copyJobs";
import { DeleteObjectsJob } from "./deleteJobs";

export interface ReplaceObjectsJob {
  deleteJob: DeleteObjectsJob;
  copyJob: CopyObjectsJob;
}
