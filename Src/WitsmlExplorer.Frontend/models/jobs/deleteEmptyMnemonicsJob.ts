import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";

export interface DeleteEmptyMnemonicsJob {
  wells: WellReference[];
  wellbores: WellboreReference[];
  nullDepthValue: number;
  nullTimeValue: string;
}
