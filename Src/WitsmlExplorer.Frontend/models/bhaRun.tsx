import Wellbore from "./wellbore";
import CommonData from "./commonData";
import Measure from "./measure";

export default interface BhaRun {
  uid: string;
  wellUid: string;
  wellboreUid: string;
  wellboreName: string;
  name: string;
  numStringRun: string;
  tubular: string;
  dTimStart: Date;
  dTimStop: Date;
  dTimStartDrilling: Date;
  dTimStopDrilling: Date;
  planDogLeg: Measure;
  actDogLeg: Measure;
  actDogLegMx: Measure;
  statusBha: string;
  numBitRun: string;
  reasonTrip: string;
  objectiveBha: string;
  commonData: CommonData;
}

export const getBhaRunProperties = (bhaRun: BhaRun, wellbore: Wellbore): Map<string, string> => {
  return new Map([
    ["Well", wellbore.wellName],
    ["UID Well", bhaRun.wellUid],
    ["Wellbore", wellbore.name],
    ["UID Wellbore", bhaRun.wellboreUid],
    ["BhaRun", bhaRun.name]
  ]);
};
