import Measure from "./measure";

export default interface RiskObject {
  uid: string;
  name: string;
  wellboreUid: string;
  wellboreName: string;
  wellUid: string;
  wellName?: string;
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
  sourceName: string;
  dTimCreation?: Date;
  dTimLastChange?: Date;
  itemState?: string;
}

export function emptyRiskObject(): RiskObject {
  return {
    wellboreUid: "",
    wellboreName: "",
    wellUid: "",
    wellName: "",
    uid: "",
    name: "",
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
    sourceName: "",
    dTimCreation: null,
    dTimLastChange: null,
    itemState: ""
  };
}

export const calculateRiskObjectNodeId = (riskObject: RiskObject): string => {
  return riskObject.wellUid + riskObject.wellboreUid + riskObject.uid;
};

export const getRiskObjectProperties = (riskObject: RiskObject): Map<string, string> => {
  return new Map([
    ["Well", riskObject.wellName],
    ["UID Well", riskObject.wellUid],
    ["Wellbore", riskObject.wellboreName],
    ["UID Wellbore", riskObject.wellboreUid],
    ["Risk", riskObject.name],
    ["UID Risk", riskObject.uid]
  ]);
};
