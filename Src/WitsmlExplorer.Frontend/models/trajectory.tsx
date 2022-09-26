import ObjectOnWellbore from "./objectOnWellbore";
import TrajectoryStation from "./trajectoryStation";

export default interface Trajectory extends ObjectOnWellbore {
  mdMin: number;
  mdMax: number;
  aziRef: string;
  dTimTrajStart: Date;
  dTimTrajEnd: Date;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
  trajectoryStations: TrajectoryStation[];
}
