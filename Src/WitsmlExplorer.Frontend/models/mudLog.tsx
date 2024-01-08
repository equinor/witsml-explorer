import CommonData from "models/commonData";
import MeasureWithDatum from "models/measureWithDatum";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface MudLog extends ObjectOnWellbore {
  mudLogCompany: string;
  mudLogEngineers: string;
  objectGrowing: boolean;
  startMd: MeasureWithDatum;
  endMd: MeasureWithDatum;
  commonData: CommonData;
}
