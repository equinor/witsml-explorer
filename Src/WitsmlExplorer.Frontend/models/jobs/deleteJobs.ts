import ObjectReference from "./objectReference";
import ObjectReferences from "./objectReferences";
import WellboreReference from "./wellboreReference";

export interface DeleteObjectsJob {
  toDelete: ObjectReferences;
}

export interface DeleteMnemonicsJob {
  toDelete: {
    logReference: ObjectReference;
    mnemonics: string[];
  };
}

export interface DeleteTrajectoryStationsJob {
  toDelete: {
    trajectoryReference: ObjectReference;
    trajectoryStationUids: string[];
  };
}

export interface DeleteTubularComponentsJob {
  toDelete: {
    tubularReference: ObjectReference;
    tubularComponentUids: string[];
  };
}

export interface DeleteWellboreJob {
  toDelete: WellboreReference;
}

export interface DeleteWellJob {
  toDelete: {
    wellUid: string;
  };
}
