import ObjectOnWellbore from "./objectOnWellbore";
import TrajectoryStation from "./trajectoryStation";
import CommonData from "./commonData";

export default interface Trajectory extends ObjectOnWellbore {
  mdMin: number;
  mdMax: number;
  aziRef: string;
  dTimTrajStart: string;
  dTimTrajEnd: string;
  serviceCompany?: string;
  trajectoryStations: TrajectoryStation[];
  commonData: CommonData;
}
