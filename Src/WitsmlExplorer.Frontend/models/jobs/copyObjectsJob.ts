import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyObjectsJob {
  source: ObjectReferences;
  target: WellboreReference;
}
