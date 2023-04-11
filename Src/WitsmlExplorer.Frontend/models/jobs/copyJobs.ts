import ComponentReferences from "./componentReferences";
import ObjectReference from "./objectReference";
import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";
import WellReference from "./wellReference";

export interface CopyWellJob {
  source: WellReference;
  target: WellReference;
}

export interface CopyWellboreJob {
  source: WellboreReference;
  target: WellboreReference;
}

export interface CopyLogJob {
  source: ObjectReferences;
  target: WellboreReference;
}

export interface CopyObjectsJob {
  source: ObjectReferences;
  target: WellboreReference;
}

export interface CopyComponentsJob {
  source: ComponentReferences;
  target: ObjectReference;
}

export interface CopyLogsWithParentJob extends CopyLogJob {
  copyWellJob?: CopyWellJob;
  copyWellboreJob?: CopyWellboreJob;
}
