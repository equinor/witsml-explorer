import MeasureWithDatum from "./measureWithDatum.ts";

export default interface WellDatum {
  name: string;
  code: string;
  elevation: MeasureWithDatum;
}
