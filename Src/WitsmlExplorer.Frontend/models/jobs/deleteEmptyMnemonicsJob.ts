import WellboreReference from "./wellboreReference";
import WellReference from "./wellReference";

export interface DeleteEmptyMnemonicsJob {
  wells: WellReference[];
  wellbores: WellboreReference[];
  nullDepthValue: number;
  nullTimeValue: string;
}
