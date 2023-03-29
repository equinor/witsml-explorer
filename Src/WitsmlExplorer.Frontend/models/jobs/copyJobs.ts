import ComponentReferences from "./componentReferences";
import ObjectReference from "./objectReference";
import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export interface CopyObjectsJob {
  source: ObjectReferences;
  target: WellboreReference;
}

export interface CopyComponentsJob {
  source: ComponentReferences;
  target: ObjectReference;
  startIndex?: string;
  endIndex?: string;
}
