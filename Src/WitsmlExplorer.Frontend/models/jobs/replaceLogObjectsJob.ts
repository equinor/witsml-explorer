import CopyObjectsJob from "./copyObjectsJob";
import { DeleteObjectsJob } from "./deleteJobs";

export interface ReplaceLogObjectsJob {
  deleteJob: DeleteObjectsJob;
  copyJob: CopyObjectsJob;
}
