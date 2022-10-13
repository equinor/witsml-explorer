import ComponentReferences from "./componentReferences";
import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export interface DeleteObjectsJob {
  toDelete: ObjectReferences;
}

export interface DeleteComponentsJob {
  toDelete: ComponentReferences;
}

export interface DeleteWellboreJob {
  toDelete: WellboreReference;
}

export interface DeleteWellJob {
  toDelete: {
    wellUid: string;
  };
}
