import Measure from "./measure";
import MeasureWithDatum from "./measureWithDatum";

export default interface WbGeometrySection {
  uid: string;
  typeHoleCasing: string;
  mdTop: MeasureWithDatum;
  mdBottom: MeasureWithDatum;
  tvdTop: MeasureWithDatum;
  tvdBottom: MeasureWithDatum;
  idSection: Measure;
  odSection: Measure;
  wtPerLen: Measure;
  grade: string;
  curveConductor: boolean;
  diaDrift: Measure;
  factFric: number;
}
