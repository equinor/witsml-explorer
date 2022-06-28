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
  mdHoleStart: string;
  mdHoleEnd: string;
  extendCategory: string;
  affectedPersonnel: string;
  dTimEnd: Date;
  dTimStart: Date;
  tvdHoleStart: string;
  vdHoleEnd: string;
  mdBitStart: string;
  mdBitEnd: string;
  diaHole: string;
  severityLevel: string;
  probabilityLevel: string;
  summary: string;
  details: string;
  identification: string;
  contigency: string;
  mitigation: string;
  sourceName: string;
  // skal denne være med?
  //commonData: CommonData;
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
    mdHoleStart: "",
    mdHoleEnd: "",
    extendCategory: "",
    affectedPersonnel: "",
    dTimEnd: null,
    dTimStart: null,
    tvdHoleStart: "",
    vdHoleEnd: "",
    mdBitStart: "",
    mdBitEnd: "",
    diaHole: "",
    severityLevel: "",
    probabilityLevel: "",
    summary: "",
    details: "",
    identification: "",
    contigency: "",
    mitigation: "",
    sourceName: ""
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
