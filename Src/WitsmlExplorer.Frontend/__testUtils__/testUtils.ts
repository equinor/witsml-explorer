import CommonData from "../models/commonData";
import LogCurveInfo from "../models/logCurveInfo";
import LogCurveInfoAxisDefinition from "../models/logCurveInfoAxisDefinition";
import LogObject from "../models/logObject";
import ObjectOnWellbore from "../models/objectOnWellbore";

function getObjectOnWellbore(): ObjectOnWellbore {
  return {
    uid: "uid",
    wellboreUid: "wellboreUid",
    wellUid: "wellUid",
    name: "name",
    wellboreName: "wellboreName",
    wellName: "wellName"
  };
}

function getLogObject(overrides?: Partial<LogObject>): LogObject {
  return {
    ...getObjectOnWellbore(),
    indexType: "measured depth",
    startIndex: "0",
    endIndex: "1000",
    objectGrowing: false,
    serviceCompany: "serviceCompany",
    runNumber: "runNumber",
    indexCurve: "DEP",
    ...overrides,
    commonData: { ...getCommonData(overrides?.commonData || {}) }
  };
}

function getCommonData(overrides?: Partial<CommonData>): CommonData {
  return {
    sourceName: "",
    dTimCreation: "",
    dTimLastChange: "",
    itemState: "",
    comments: "",
    defaultDatum: "",
    serviceCategory: "",
    ...overrides
  };
}

function getLogCurveInfo(overrides?: Partial<LogCurveInfo>): LogCurveInfo {
  return {
    uid: "uid",
    mnemonic: "mnemonic",
    minDateTimeIndex: "",
    minDepthIndex: "",
    maxDateTimeIndex: "",
    maxDepthIndex: "",
    classWitsml: "classWitsml",
    unit: "unit",
    mnemAlias: "mnemAlias",
    axisDefinitions: [],
    ...overrides,
    sensorOffset: { ...getMeasure(overrides?.sensorOffset || {}) }
  };
}

function getMeasure(overrides?: Partial<Measure>): Measure {
  return {
    value: 0,
    uom: "m",
    ...overrides
  };
}

function getAxisDefinition(overrides?: Partial<LogCurveInfoAxisDefinition>): LogCurveInfoAxisDefinition {
  return {
    uid: "axisDefinitionUid",
    order: 1,
    count: 8,
    doubleValues: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16",
    ...overrides
  };
}

export default interface Measure {
  value: number;
  uom: string;
}

export { getLogObject, getCommonData, getLogCurveInfo, getMeasure, getAxisDefinition };
