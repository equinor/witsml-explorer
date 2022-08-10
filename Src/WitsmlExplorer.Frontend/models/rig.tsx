import CommonData from "./commonData";
import Measure from "./measure";

export default interface Rig {
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
  name: string;
  nameContact: string;
  owner: string;
  ratingDrillDepth: Measure;
  ratingWaterDepth: Measure;
  registration: string;
  telNumber: string;
  typeRig: string;
  uid: string;
  uidWellbore: string;
  wellboreName: string;
  wellName?: string;
  uidWell: string;
  yearEntService: string;
}

export function emptyRig(): Rig {
  return {
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
    name: "",
    nameContact: "",
    owner: "",
    ratingDrillDepth: null,
    ratingWaterDepth: null,
    registration: "",
    typeRig: "",
    telNumber: "",
    uid: "",
    uidWellbore: "",
    wellboreName: "",
    wellName: "",
    uidWell: "",
    yearEntService: "",
    commonData: {
      sourceName: "",
      dTimCreation: null,
      dTimLastChange: null,
      itemState: ""
    }
  };
}
export const calculateRigNodeId = (rig: Rig): string => {
  return rig.uidWell + rig.uidWellbore + rig.uid;
};

export const getRigProperties = (rig: Rig): Map<string, string> => {
  return new Map([
    ["Well", rig.wellName],
    ["UID Well", rig.uidWell],
    ["Wellbore", rig.wellboreName],
    ["UID Wellbore", rig.uidWellbore],
    ["Rig", rig.name],
    ["UID Rig", rig.uid]
  ]);
};
