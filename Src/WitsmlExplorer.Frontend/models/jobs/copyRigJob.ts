import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyRigJob {
  source: ObjectReferences;
  target: WellboreReference;
}
