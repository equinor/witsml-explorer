import ObjectOnWellbore from "./objectOnWellbore";
import TrajectoryStation from "./trajectoryStation";

export default interface Trajectory extends ObjectOnWellbore {
  mdMin: number;
  mdMax: number;
  aziRef: string;
  dTimTrajStart: string;
  dTimTrajEnd: string;
  dateTimeCreation?: string;
  dateTimeLastChange?: string;
  trajectoryStations: TrajectoryStation[];
}
