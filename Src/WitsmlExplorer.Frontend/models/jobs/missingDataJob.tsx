import WellReference from "models/jobs/wellReference";
import WellboreReference from "models/jobs/wellboreReference";

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
