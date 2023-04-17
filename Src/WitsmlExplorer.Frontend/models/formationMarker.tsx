import CommonData from "./commonData";
import Measure from "./measure";
import MeasureWithDatum from "./measureWithDatum";
import ObjectOnWellbore from "./objectOnWellbore";
import Struct from "./struct";

export default interface FormationMarker extends ObjectOnWellbore {
  mdPrognosed?: MeasureWithDatum;
  tvdPrognosed?: MeasureWithDatum;
  mdTopSample?: MeasureWithDatum;
  tvdTopSample?: MeasureWithDatum;
  thicknessBed?: Measure;
  thicknessApparent?: Measure;
  thicknessPerpen?: Measure;
  mdLogSample?: MeasureWithDatum;
  tvdLogSample?: MeasureWithDatum;
  dip?: Measure;
  dipDirection?: Measure;
  lithostratigraphic?: Struct;
  chronostratigraphic?: Struct;
  description?: string;
  commonData?: CommonData;
}
