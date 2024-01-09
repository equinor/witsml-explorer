import CommonData from "models/commonData";
import Measure from "models/measure";
import ObjectOnWellbore from "models/objectOnWellbore";
import RefNameString from "models/refNameString";

export default interface BhaRun extends ObjectOnWellbore {
  numStringRun: string;
  tubular: RefNameString;
  dTimStart: string;
  dTimStop: string;
  dTimStartDrilling: string;
  dTimStopDrilling: string;
  planDogleg: Measure;
  actDogleg: Measure;
  actDoglegMx: Measure;
  statusBha: string;
  numBitRun: string;
  reasonTrip: string;
  objectiveBha: string;
  commonData: CommonData;
}
