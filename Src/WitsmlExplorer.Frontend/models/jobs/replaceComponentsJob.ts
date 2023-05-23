import { CopyComponentsJob } from "./copyJobs";
import { DeleteComponentsJob } from "./deleteJobs";

export interface ReplaceComponentsJob {
  deleteJob: DeleteComponentsJob;
  copyJob: CopyComponentsJob;
}
