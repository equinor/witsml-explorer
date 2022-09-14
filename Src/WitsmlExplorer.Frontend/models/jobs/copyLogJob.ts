import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyLogJob {
  source: ObjectReferences;
  target: WellboreReference;
}
