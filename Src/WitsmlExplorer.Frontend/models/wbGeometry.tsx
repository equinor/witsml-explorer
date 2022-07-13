import Measure from "./measure";
import CommonData from "./commonData";

export default interface WbGeometryObject {
  uid: string;
  name: string;
  wellboreUid: string;
  wellboreName: string;
  wellUid: string;
  wellName?: string;
  dTimReport?: Date;
  mdBottom?: Measure;
  gapAir?: Measure;
  depthWaterMean?: Measure;
  commonData: CommonData;
}

export function emptyWbGeometryObject(): WbGeometryObject {
  return {
    wellboreUid: "",
    wellboreName: "",
    wellUid: "",
    wellName: "",
    uid: "",
    name: "",
    dTimReport: null,
    mdBottom: null,
    gapAir: null,
    depthWaterMean: null,
    commonData: {
      sourceName: "",
      dTimCreation: null,
      dTimLastChange: null,
      itemState: "",
      comments: ""
    }
  };
}

export const calculateWbGeometryObjectNodeId = (wbGeometryObject: WbGeometryObject): string => {
  return wbGeometryObject.wellUid + wbGeometryObject.wellboreUid + wbGeometryObject.uid;
};

export const getWbGeometryObjectProperties = (wbGeometryObject: WbGeometryObject): Map<string, string> => {
  return new Map([
    ["Well", wbGeometryObject.wellName],
    ["UID Well", wbGeometryObject.wellUid],
    ["Wellbore", wbGeometryObject.wellboreName],
    ["UID Wellbore", wbGeometryObject.wellboreUid],
    ["WbGeometry", wbGeometryObject.name],
    ["UID Risk", wbGeometryObject.uid]
  ]);
};
