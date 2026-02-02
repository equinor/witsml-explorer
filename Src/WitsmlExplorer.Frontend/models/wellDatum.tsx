import MeasureWithDatum from "./measureWithDatum.ts";

export default interface WellDatum {
  uid: string;
  name: string;
  code: string;
  elevation: MeasureWithDatum;
}
