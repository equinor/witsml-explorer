import CommonData from "models/commonData";
import MeasureWithDatum from "models/measureWithDatum";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface FluidsReport extends ObjectOnWellbore {
  dTim: string;
  md: MeasureWithDatum;
  tvd: MeasureWithDatum;
  numReport: string;
  commonData: CommonData;
}
