import Lithology from "models/lithology";
import Measure from "models/measure";
import MeasureWithDatum from "models/measureWithDatum";

export default interface GeologyInterval {
  uid: string;
  typeLithology: string;
  mdTop: MeasureWithDatum;
  mdBottom: MeasureWithDatum;
  tvdTop: MeasureWithDatum;
  tvdBase: MeasureWithDatum;
  ropAv: Measure;
  wobAv: Measure;
  tqAv: Measure;
  currentAv: Measure;
  rpmAv: Measure;
  wtMudAv: Measure;
  ecdTdAv: Measure;
  dxcAv: string;
  description: string;
  lithologies: Lithology[];
}
