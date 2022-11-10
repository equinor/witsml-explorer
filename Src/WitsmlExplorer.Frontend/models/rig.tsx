import CommonData from "./commonData";
import Measure from "./measure";
import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface Rig extends ObjectOnWellbore {
  airGap: Measure;
  approvals: string;
  commonData: CommonData;
  classRig: string;
  dTimEndOp: Date;
  dTimStartOp: Date;
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

export function emptyRig(): Rig {
  return {
    ...emptyObjectOnWellbore(),
    airGap: null,
    approvals: "",
    classRig: "",
    dTimStartOp: null,
    dTimEndOp: null,
    emailAddress: "",
    faxNumber: "",
    itemState: "",
    isOffshore: null,
    manufacturer: "",
    nameContact: "",
    owner: "",
    ratingDrillDepth: null,
    ratingWaterDepth: null,
    registration: "",
    typeRig: "",
    telNumber: "",
    yearEntService: "",
    commonData: {
      sourceName: "",
      dTimCreation: "",
      dTimLastChange: "",
      itemState: ""
    }
  };
}
