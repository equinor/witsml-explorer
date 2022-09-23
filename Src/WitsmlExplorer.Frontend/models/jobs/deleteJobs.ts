import LogReference from "./logReference";
import ObjectReferences from "./objectReferences";
import TrajectoryReference from "./trajectoryReference";
import TubularReference from "./tubularReference";
import WellboreReference from "./wellboreReference";

export interface DeleteObjectsJob {
  toDelete: ObjectReferences;
}

export interface DeleteMnemonicsJob {
  toDelete: {
    logReference: LogReference;
    mnemonics: string[];
  };
}

export interface DeleteTrajectoryStationsJob {
  toDelete: {
    trajectoryReference: TrajectoryReference;
    trajectoryStationUids: string[];
  };
}

export interface DeleteTubularComponentsJob {
  toDelete: {
    tubularReference: TubularReference;
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
