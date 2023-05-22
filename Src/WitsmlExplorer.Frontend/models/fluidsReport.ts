import CommonData from "./commonData";
import MeasureWithDatum from "./measureWithDatum";
import ObjectOnWellbore from "./objectOnWellbore";

export default interface FluidsReport extends ObjectOnWellbore {
  dTim: string;
  md: MeasureWithDatum;
  tvd: MeasureWithDatum;
  numReport: string;
  commonData: CommonData;
}
