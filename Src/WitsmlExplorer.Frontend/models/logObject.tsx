import CommonData from "./commonData";
import ObjectOnWellbore from "./objectOnWellbore";

export default interface LogObject extends ObjectOnWellbore {
  indexType?: string;
  startIndex?: string;
  endIndex?: string;
  objectGrowing?: boolean;
  serviceCompany?: string;
  runNumber?: string;
  indexCurve?: string;
  commonData?: CommonData;
}

export const indexToNumber = (index: string): number => {
  if (index == null || index === "") {
    return NaN;
  }
  return Number(index.replace(/[^\d.-]/g, ""));
};
