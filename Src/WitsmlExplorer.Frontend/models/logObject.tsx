export default interface LogObject {
  uid: string;
  name: string;
  wellUid: string;
  wellName?: string;
  wellboreUid: string;
  wellboreName?: string;
  indexType?: string;
  startIndex?: string;
  endIndex?: string;
  objectGrowing?: boolean;
  serviceCompany?: string;
  runNumber?: string;
  indexCurve?: string;
}

export function emptyLogObject(): LogObject {
  return {
    uid: "",
    name: "",
    wellUid: "",
    wellName: "",
    wellboreUid: "",
    wellboreName: "",
    indexType: "",
    startIndex: "",
    endIndex: "",
    indexCurve: "",
    objectGrowing: false,
    serviceCompany: ""
  };
}

export const calculateLogObjectNodeId = (logObject: LogObject): string => {
  return logObject.wellUid + logObject.wellboreUid + logObject.uid;
};

export const getLogObjectProperties = (logObject: LogObject): Map<string, string> => {
  return new Map([
    ["Well", logObject.wellName],
    ["UID Well", logObject.wellUid],
    ["Wellbore", logObject.wellboreName],
    ["UID Wellbore", logObject.wellboreUid],
    ["Log", logObject.name],
    ["UID Log", logObject.uid]
  ]);
};
