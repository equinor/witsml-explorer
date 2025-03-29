import ComponentReferences from "models/jobs/componentReferences";
import ObjectReference from "models/jobs/objectReference";
import ObjectReferences from "models/jobs/objectReferences";
import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";

export interface CopyWellJob {
  source: WellReference;
  target: WellReference;
}

export interface CopyWellboreJob {
  source: WellboreReference;
  target: WellboreReference;
}

export interface CopyObjectsJob {
  source: ObjectReferences;
  target: WellboreReference;
  targetObjectUid?: string;
  targetObjectName?: string;
}

export interface CopyComponentsJob {
  source: ComponentReferences;
  target: ObjectReference;
  startIndex?: string;
  endIndex?: string;
}

export interface CopyWithParentJob extends CopyObjectsJob {
  copyWellJob?: CopyWellJob;
  copyWellboreJob?: CopyWellboreJob;
}

export interface CopyWellboreWithObjectsJob {
  source: WellboreReference;
  target: WellReference;
}
