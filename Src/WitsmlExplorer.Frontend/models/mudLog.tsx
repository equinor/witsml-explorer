import CommonData from "./commonData";
import MeasureWithDatum from "./measureWithDatum";
import ObjectOnWellbore from "./objectOnWellbore";

export default interface MudLog extends ObjectOnWellbore {
  mudLogCompany: string;
  mudLogEngineers: string;
  objectGrowing: boolean;
  startMd: MeasureWithDatum;
  endMd: MeasureWithDatum;
  commonData: CommonData;
}
