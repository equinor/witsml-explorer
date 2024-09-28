import ComponentReferences from "models/jobs/componentReferences";
import ObjectReferences from "models/jobs/objectReferences";
import WellboreReference from "models/jobs/wellboreReference";

export interface DeleteObjectsJob {
  toDelete: ObjectReferences;
}

export interface DeleteComponentsJob {
  toDelete: ComponentReferences;
}

export interface DeleteWellboreJob {
  toDelete: WellboreReference;
  cascadedDelete: boolean;
}

export interface DeleteWellJob {
  toDelete: {
    wellUid: string;
    wellName: string;
  };
  cascadedDelete: boolean;
}
