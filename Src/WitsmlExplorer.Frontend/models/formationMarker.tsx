import CommonData from "models/commonData";
import Measure from "models/measure";
import MeasureWithDatum from "models/measureWithDatum";
import ObjectOnWellbore from "models/objectOnWellbore";
import StratigraphicStruct from "models/stratigraphicStruct";

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
