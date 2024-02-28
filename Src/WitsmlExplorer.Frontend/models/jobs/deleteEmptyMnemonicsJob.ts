import ObjectReference from "models/jobs/objectReference";
import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";

export interface DeleteEmptyMnemonicsJob {
  wells: WellReference[];
  wellbores: WellboreReference[];
  logs: ObjectReference[];
  nullDepthValue: number;
  nullTimeValue: string;
  deleteNullIndex: boolean;
}
