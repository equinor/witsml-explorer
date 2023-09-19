import WellReference from "./wellReference";
import WellboreReference from "./wellboreReference";

// Either wellReferences or wellboreReferences should be set, the other should be empty.
export default interface MissingDataJob {
  wellReferences: WellReference[];
  wellboreReferences: WellboreReference[];
  missingDataChecks: MissingDataCheck[];
}

export interface MissingDataCheck {
  id: string;
  objectType: string;
  properties: string[];
}
