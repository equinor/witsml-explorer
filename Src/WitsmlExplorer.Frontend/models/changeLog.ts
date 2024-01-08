import CommonData from "models/commonData";
import ObjectOnWellbore from "models/objectOnWellbore";

// ChangeLog extends ObjectOnWellbore despite not having uid and name fields in WITSML
// These fields are set in the API to conform to ObjectOnWellbore
export default interface ChangeLog extends ObjectOnWellbore {
  uidObject: string;
  nameObject: string;
  lastChangeType: string;
  commonData: CommonData;
}
