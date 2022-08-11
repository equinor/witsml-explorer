import BhaRunReferences from "./bhaRunReferences";
import LogReference from "./logReference";
import LogReferences from "./logReferences";
import RigReferences from "./rigReferences";
import RiskReferences from "./riskReferences";
import TrajectoryReference from "./trajectoryReference";
import TubularReference from "./tubularReference";
import TubularReferences from "./tubularReferences";
import WbGeometryObjectReferences from "./wbGeometryReferences";
import WellboreReference from "./wellboreReference";

export interface DeleteBhaRunsJob {
  source: BhaRunReferences;
}

export interface DeleteLogObjectsJob {
  source: LogReferences;
}

export interface DeleteMnemonicsJob {
  source: {
    logObject: LogReference;
    mnemonics: string[];
  };
}

export interface DeleteRigsJob {
  source: RigReferences;
}

export interface DeleteRisksJob {
  source: RiskReferences;
}

export interface DeleteTrajectoryJob {
  source: TrajectoryReference;
}

export interface DeleteTrajectoryStationsJob {
  source: {
    trajectoryReference: TrajectoryReference;
    trajectoryStationUids: string[];
  };
}

export interface DeleteTubularComponentsJob {
  source: {
    tubularReference: TubularReference;
    tubularComponentUids: string[];
  };
}

export interface DeleteTubularsJob {
  source: TubularReferences;
}

export interface DeleteWbGeometrysJob {
  source: WbGeometryObjectReferences;
}

export interface DeleteWellboreJob {
  source: WellboreReference;
}

export interface DeleteWellJob {
  source: {
    wellUid: string;
  };
}
