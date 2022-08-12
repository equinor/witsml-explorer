import BhaRunReferences from "./bhaRunReferences";
import LogReference from "./logReference";
import LogReferences from "./logReferences";
import MessageObjectReferences from "./messageObjectReferences";
import RigReferences from "./rigReferences";
import RiskReferences from "./riskReferences";
import TrajectoryReference from "./trajectoryReference";
import TubularReference from "./tubularReference";
import TubularReferences from "./tubularReferences";
import WbGeometryObjectReferences from "./wbGeometryReferences";
import WellboreReference from "./wellboreReference";

export interface DeleteBhaRunsJob {
  toDelete: BhaRunReferences;
}

export interface DeleteLogObjectsJob {
  toDelete: LogReferences;
}

export interface DeleteMessageObjectsJob {
  toDelete: MessageObjectReferences;
}

export interface DeleteMnemonicsJob {
  toDelete: {
    logReference: LogReference;
    mnemonics: string[];
  };
}

export interface DeleteRigsJob {
  toDelete: RigReferences;
}

export interface DeleteRisksJob {
  toDelete: RiskReferences;
}

export interface DeleteTrajectoryJob {
  toDelete: TrajectoryReference;
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
  toDelete: TubularReferences;
}

export interface DeleteWbGeometrysJob {
  toDelete: WbGeometryObjectReferences;
}

export interface DeleteWellboreJob {
  toDelete: WellboreReference;
}

export interface DeleteWellJob {
  toDelete: {
    wellUid: string;
  };
}
