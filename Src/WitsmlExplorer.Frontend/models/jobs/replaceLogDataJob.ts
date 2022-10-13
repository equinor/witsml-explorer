import { CopyComponentsJob } from "./copyJobs";
import { DeleteComponentsJob } from "./deleteJobs";

export interface ReplaceLogDataJob {
  deleteJob: DeleteComponentsJob;
  copyJob: CopyComponentsJob;
}
