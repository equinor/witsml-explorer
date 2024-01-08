import CommonData from "models/commonData";
import Measure from "models/measure";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface Rig extends ObjectOnWellbore {
  airGap: Measure;
  approvals: string;
  commonData: CommonData;
  classRig: string;
  dTimEndOp: string;
  dTimStartOp: string;
  emailAddress: string;
  faxNumber: string;
  itemState?: string;
  isOffshore?: boolean;
  manufacturer: string;
  nameContact: string;
  owner: string;
  ratingDrillDepth: Measure;
  ratingWaterDepth: Measure;
  registration: string;
  telNumber: string;
  typeRig: string;
  yearEntService: string;
}
