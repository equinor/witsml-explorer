import LogReference from "./logReference";
import ObjectReferences from "./objectReferences";
import TrajectoryReference from "./trajectoryReference";
import TubularReference from "./tubularReference";
import WellboreReference from "./wellboreReference";

export interface DeleteBhaRunsJob {
  toDelete: ObjectReferences;
}

export interface DeleteLogObjectsJob {
  toDelete: ObjectReferences;
}

export interface DeleteMessageObjectsJob {
  toDelete: ObjectReferences;
}

export interface DeleteMnemonicsJob {
  toDelete: {
    logReference: LogReference;
    mnemonics: string[];
  };
}

export interface DeleteRigsJob {
  toDelete: ObjectReferences;
}

export interface DeleteRisksJob {
  toDelete: ObjectReferences;
}

export interface DeleteTrajectoriesJob {
  toDelete: ObjectReferences;
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

export interface DeleteTubularsJob {
  toDelete: ObjectReferences;
}

export interface DeleteWbGeometrysJob {
  toDelete: ObjectReferences;
}

export interface DeleteWellboreJob {
  toDelete: WellboreReference;
}

export interface DeleteWellJob {
  toDelete: {
    wellUid: string;
  };
}
