import CommonData from "models/commonData";
import MeasureWithDatum from "models/measureWithDatum";
import ObjectOnWellbore from "models/objectOnWellbore";
import TrajectoryStation from "models/trajectoryStation";

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

export const aziRefValues = [
  "unknown",
  "grid north",
  "magnetic north",
  "true north"
];
