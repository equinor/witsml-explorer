import Measure from "./measure";

export default interface Rig {
  airGap: Measure;
  approvals: string;
  classRig: string;
  dtimEndOp: Date;
  dTimStartOp: Date;
  emailAddress: string;
  faxNumber: string;
  itemState?: string;
  isOffshoreText: string;
  manufacturer: string;
  name: string;
  nameContact: string;
  owner: string;
  ratingDrillDepth: Measure;
  ratingWaterDepth: Measure;
  registration: string;
  telNumber: string;
  typeRig: string;
  uid: string;
  wellboreUid: string;
  wellUid: string;
  yearEntService: string;
}

export function emptyRig(): Rig {
  return {
    airGap: null,
    approvals: "",
    classRig: "",
    dTimStartOp: null,
    dtimEndOp: null,
    emailAddress: "",
    faxNumber: "",
    itemState: "",
    isOffshoreText: "",
    manufacturer: "",
    name: "",
    nameContact: "",
    owner: "",
    ratingDrillDepth: null,
    ratingWaterDepth: null,
    registration: "",
    typeRig: "",
    telNumber: "",
    uid: "",
    wellboreUid: "",
    wellUid: "",
    yearEntService: ""
  };
}
