import CommonData from "models/commonData";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface LogObject extends ObjectOnWellbore {
  indexType?: string;
  startIndex?: string;
  endIndex?: string;
  objectGrowing?: boolean;
  serviceCompany?: string;
  runNumber?: string;
  indexCurve?: string;
  direction?: string;
  mnemonics?: string;
  commonData?: CommonData;
  sameNameIndex?: string;
}

export const indexToNumber = (index: string): number => {
  if (index == null || index === "") {
    return NaN;
  }
  return Number(index.replace(/[^\d.-]/g, ""));
};
