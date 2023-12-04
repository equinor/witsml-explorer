import CommonData from "./commonData";
import MeasureWithDatum from "./measureWithDatum";
import ObjectOnWellbore from "./objectOnWellbore";
import TrajectoryStation from "./trajectoryStation";

export default interface Trajectory extends ObjectOnWellbore {
  mdMin: MeasureWithDatum;
  mdMax: MeasureWithDatum;
  aziRef: string;
  dTimTrajStart: string;
  dTimTrajEnd: string;
  serviceCompany?: string;
  trajectoryStations: TrajectoryStation[];
  commonData: CommonData;
}

export const aziRefValues = ["unknown", "grid north", "magnetic north", "true north"];
