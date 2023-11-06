import Measure from "./measure";
import RawData from "./rawData";
import StnTrajCorUsed from "./stnTrajCorUsed";
import StnTrajValid from "./stnTrajValid";

export default interface TrajectoryStation {
  uid: string;
  md: Measure;
  tvd?: Measure;
  incl?: Measure;
  azi?: Measure;
  dTimStn?: string;
  typeTrajStation: string;
  dls?: Measure;
  mtf?: Measure;
  gtf?: Measure;
  dispNs?: Measure;
  dispEw?: Measure;
  vertSect?: Measure;
  rateTurn?: Measure;
  rateBuild?: Measure;
  gravTotalUncert?: Measure;
  dipAngleUncert?: Measure;
  magTotalUncert?: Measure;
  sagCorUsed: boolean;
  magDrlstrCorUsed: boolean;
  gravTotalFieldReference?: Measure;
  magTotalFieldReference?: Measure;
  magDipAngleReference?: Measure;
  statusTrajStation?: Measure;
  gravAxialRaw?: Measure;
  gravTran1Raw?: Measure;
  gravTran2Raw?: Measure;
  magAxialRaw?: Measure;
  rawData: RawData;
  corUsed: StnTrajCorUsed;
  valid: StnTrajValid;
}
