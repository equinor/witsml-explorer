import MeasureWithDatum from "./measureWithDatum";
import Rheometer from "./rheometer";

export default interface Fluid {
  uid: string;
  type: string;
  locationSample: string;
  dTim: string;
  md: MeasureWithDatum;
  tvd: MeasureWithDatum;
  rheometers: Rheometer[];
}
