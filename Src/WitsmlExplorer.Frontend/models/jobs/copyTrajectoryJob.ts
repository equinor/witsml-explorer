import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyTrajectoryJob {
  source: ObjectReferences;
  target: WellboreReference;
}
