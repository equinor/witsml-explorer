import CommonData from "./commonData";
import Measure from "./measure";
import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface RiskObject extends ObjectOnWellbore {
  type: string;
  category: string;
  subCategory: string;
  extendCategory: string;
  affectedPersonnel: string;
  dTimEnd?: Date;
  dTimStart?: Date;
  mdBitStart: Measure;
  mdBitEnd: Measure;
  severityLevel: string;
  probabilityLevel: string;
  summary: string;
  details: string;
  commonData: CommonData;
}

export function emptyRiskObject(): RiskObject {
  return {
    ...emptyObjectOnWellbore(),
    type: "",
    category: "",
    subCategory: "",
    extendCategory: "",
    affectedPersonnel: "",
    dTimEnd: null,
    dTimStart: null,
    mdBitStart: null,
    mdBitEnd: null,
    severityLevel: "",
    probabilityLevel: "",
    summary: "",
    details: "",
    commonData: {
      sourceName: "",
      dTimCreation: "",
      dTimLastChange: "",
      itemState: ""
    }
  };
}
