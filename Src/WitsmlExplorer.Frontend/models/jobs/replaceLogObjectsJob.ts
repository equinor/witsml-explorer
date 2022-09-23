import CopyLogJob from "./copyLogJob";
import { DeleteObjectsJob } from "./deleteJobs";

export interface ReplaceLogObjectsJob {
  deleteJob: DeleteObjectsJob;
  copyJob: CopyLogJob;
}
