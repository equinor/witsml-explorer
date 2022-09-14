import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyBhaRunJob {
  source: ObjectReferences;
  target: WellboreReference;
}
