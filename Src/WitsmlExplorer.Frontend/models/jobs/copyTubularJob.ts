import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyTubularJob {
  source: ObjectReferences;
  target: WellboreReference;
}
