import { CopyLogDataJob } from "./copyLogDataJob";
import { DeleteMnemonicsJob } from "./deleteJobs";

export interface ReplaceLogDataJob {
  deleteJob: DeleteMnemonicsJob;
  copyJob: CopyLogDataJob;
}
