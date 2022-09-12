import CopyLogJob from "./copyLogJob";
import { DeleteLogObjectsJob } from "./deleteJobs";

export interface ReplaceLogObjectsJob {
  deleteJob: DeleteLogObjectsJob;
  copyJob: CopyLogJob;
}
