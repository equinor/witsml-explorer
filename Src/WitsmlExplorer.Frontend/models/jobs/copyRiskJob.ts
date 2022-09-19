import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyRiskJob {
  source: ObjectReferences;
  target: WellboreReference;
}
