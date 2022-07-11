import Measure from "./measure";
export default interface WbGeometryObject {
  uid: string;
  wellboreUid: string;
  wellboreName: string;
  wellUid: string;
  wellName?: string;
  dTimReport?: Date;
  mdBottom?: Measure;
  gapAir?: Measure;
  depthWaterMean?: Measure;
  sourceName: string;
  dTimCreation?: Date;
  dTimLastChange?: Date;
  itemState?: string;
  comments?: string;
}

export function emptyWbGeomtryObject(): WbGeometryObject {
  return {
    wellboreUid: "",
    wellboreName: "",
    wellUid: "",
    wellName: "",
    uid: "",
    dTimReport: null,
    mdBottom: null,
    gapAir: null,
    depthWaterMean: null,
    sourceName: "",
    dTimCreation: null,
    dTimLastChange: null,
    itemState: "",
    comments: ""
  };
}

export const calculateRiskObjectNodeId = (wbGeometryObject: WbGeometryObject): string => {
  return wbGeometryObject.wellUid + wbGeometryObject.wellboreUid + wbGeometryObject.uid;
};

export const getRiskObjectProperties = (wbGeometryObject: WbGeometryObject): Map<string, string> => {
  return new Map([
    ["Well", wbGeometryObject.wellName],
    ["UID Well", wbGeometryObject.wellUid],
    ["Wellbore", wbGeometryObject.wellboreName],
    ["UID Wellbore", wbGeometryObject.wellboreUid],
    ["UID Risk", wbGeometryObject.uid]
  ]);
};
