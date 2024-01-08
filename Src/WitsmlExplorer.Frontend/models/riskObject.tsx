import CommonData from "models/commonData";
import Measure from "models/measure";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface RiskObject extends ObjectOnWellbore {
  type: string;
  category: string;
  subCategory: string;
  extendCategory: string;
  affectedPersonnel: string;
  dTimEnd?: string;
  dTimStart?: string;
  mdBitStart: Measure;
  mdBitEnd: Measure;
  severityLevel: string;
  probabilityLevel: string;
  summary: string;
  details: string;
  commonData: CommonData;
}
