import CommonData from "./commonData";
import Measure from "./measure";
import MeasureWithDatum from "./measureWithDatum";
import ObjectOnWellbore from "./objectOnWellbore";
import StratigraphicStruct from "./stratigraphicStruct";

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
  lithostratigraphic?: StratigraphicStruct;
  chronostratigraphic?: StratigraphicStruct;
  description?: string;
  commonData?: CommonData;
}
