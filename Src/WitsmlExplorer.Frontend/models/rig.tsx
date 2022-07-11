import Measure from "./measure";

export default interface Rig {
  airGap: Measure;
  Approvals: string;
  ClassRig: string;
  dtimEndOp: Date;
  dTimStartOp: Date;
  EmailAddress: string;
  FaxNumber: string;
  itemState?: string;
  IsOffshoreText: string;
  Manufacturer: string;
  name: string;
  NameContact: string;
  owner: string;
  ratingDrillDepth: Measure;
  ratingWaterDepth: Measure;
  Registration: string;
  TelNumber: string;
  typeRig: string;
  uid: string;
  wellboreUid: string;
  wellUid: string;
  YearEntService: string;
}

export function emptyRig(): Rig {
  return {
    airGap: null,
    Approvals: "",
    ClassRig: "",
    dTimStartOp: null,
    dtimEndOp: null,
    EmailAddress: "",
    FaxNumber: "",
    itemState: "",
    IsOffshoreText: "",
    Manufacturer: "",
    name: "",
    NameContact: "",
    owner: "",
    ratingDrillDepth: null,
    ratingWaterDepth: null,
    Registration: "",
    typeRig: "",
    TelNumber: "",
    uid: "",
    wellboreUid: "",
    wellUid: "",
    YearEntService: ""
  };
}
