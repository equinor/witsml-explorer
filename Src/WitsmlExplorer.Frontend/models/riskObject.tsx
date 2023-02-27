import CommonData from "./commonData";
import Measure from "./measure";
import ObjectOnWellbore from "./objectOnWellbore";

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
