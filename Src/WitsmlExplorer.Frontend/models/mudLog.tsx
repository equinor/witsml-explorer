import CommonData, { emptyCommonData } from "./commonData";
import MeasureWithDatum from "./measureWithDatum";
import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface MudLog extends ObjectOnWellbore {
  mudLogCompany: string;
  mudLogEngineers: string;
  startMd: MeasureWithDatum;
  endMd: MeasureWithDatum;
  commonData: CommonData;
}

export function emptyMudLog(): MudLog {
  return {
    ...emptyObjectOnWellbore(),
    mudLogCompany: "",
    mudLogEngineers: "",
    startMd: null,
    endMd: null,
    commonData: emptyCommonData()
  };
}
