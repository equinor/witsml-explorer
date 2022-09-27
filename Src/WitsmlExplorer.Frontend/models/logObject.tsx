import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface LogObject extends ObjectOnWellbore {
  indexType?: string;
  startIndex?: string;
  endIndex?: string;
  objectGrowing?: boolean;
  serviceCompany?: string;
  runNumber?: string;
  indexCurve?: string;
}

export function emptyLogObject(): LogObject {
  return {
    ...emptyObjectOnWellbore(),
    indexType: "",
    startIndex: "",
    endIndex: "",
    indexCurve: "",
    objectGrowing: false,
    serviceCompany: ""
  };
}
