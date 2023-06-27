import { ThemeProvider } from "@material-ui/core";
import { render } from "@testing-library/react";
import { SnackbarProvider } from "notistack";
import React from "react";
import { FilterContextProvider } from "../contexts/filter";
import NavigationContext from "../contexts/navigationContext";
import { initNavigationStateReducer } from "../contexts/navigationStateReducer";
import OperationContext from "../contexts/operationContext";
import { initOperationStateReducer } from "../contexts/operationStateReducer";
import AxisDefinition from "../models/AxisDefinition";
import BhaRun from "../models/bhaRun";
import ChangeLog from "../models/changeLog";
import CommonData from "../models/commonData";
import FluidsReport from "../models/fluidsReport";
import FormationMarker from "../models/formationMarker";
import LogCurveInfo from "../models/logCurveInfo";
import LogObject from "../models/logObject";
import Measure from "../models/measure";
import MeasureWithDatum from "../models/measureWithDatum";
import MessageObject from "../models/messageObject";
import MudLog from "../models/mudLog";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType, ObjectTypeToModel } from "../models/objectType";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import StratigraphicStruct from "../models/stratigraphicStruct";
import Trajectory from "../models/trajectory";
import Tubular from "../models/tubular";
import WbGeometryObject from "../models/wbGeometry";
import Well, { emptyWell } from "../models/well";
import Wellbore, { emptyWellbore } from "../models/wellbore";
import { getTheme } from "../styles/material-eds";

export function renderWithContexts(ui: React.ReactElement, { ...options } = {}) {
  const Wrapper = ({ children }: { children: React.ReactElement }) => {
    const [operationState, dispatchOperation] = initOperationStateReducer();
    const [navigationState, dispatchNavigation] = initNavigationStateReducer();

    return (
      <OperationContext.Provider value={{ operationState, dispatchOperation }}>
        <ThemeProvider theme={getTheme(operationState.theme)}>
          <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
            <FilterContextProvider>
              <SnackbarProvider>{children}</SnackbarProvider>
            </FilterContextProvider>
          </NavigationContext.Provider>
        </ThemeProvider>
      </OperationContext.Provider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

export function getWell(overrides?: Partial<Well>): Well {
  return {
    ...emptyWell(),
    ...overrides
  };
}

export function getWellbore(overrides?: Partial<Wellbore>): Wellbore {
  return {
    ...emptyWellbore(),
    ...overrides
  };
}

export function getObjectOnWellbore(overrides?: Partial<ObjectOnWellbore>): ObjectOnWellbore {
  return {
    uid: "uid",
    wellboreUid: "wellboreUid",
    wellUid: "wellUid",
    name: "name",
    wellboreName: "wellboreName",
    wellName: "wellName",
    ...overrides
  };
}

export function getBhaRun(overrides?: Partial<BhaRun>): BhaRun {
  return {
    ...getObjectOnWellbore(),
    numStringRun: "",
    tubular: "",
    tubularUidRef: "",
    dTimStart: "",
    dTimStop: "",
    dTimStartDrilling: "",
    dTimStopDrilling: "",
    planDogleg: getMeasure(),
    actDogleg: getMeasure(),
    actDoglegMx: getMeasure(),
    statusBha: "",
    numBitRun: "",
    reasonTrip: "",
    objectiveBha: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getChangeLog(overrides?: Partial<ChangeLog>): ChangeLog {
  return {
    ...getObjectOnWellbore(),
    uidObject: "",
    nameObject: "",
    lastChangeType: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getFluidsReport(overrides?: Partial<FluidsReport>): FluidsReport {
  return {
    ...getObjectOnWellbore(),
    dTim: "",
    md: getMeasureWithDatum(),
    tvd: getMeasureWithDatum(),
    numReport: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getFormationMarker(overrides?: Partial<FormationMarker>): FormationMarker {
  return {
    ...getObjectOnWellbore(),
    mdPrognosed: getMeasureWithDatum(),
    tvdPrognosed: getMeasureWithDatum(),
    mdTopSample: getMeasureWithDatum(),
    tvdTopSample: getMeasureWithDatum(),
    thicknessBed: getMeasure(),
    thicknessApparent: getMeasure(),
    thicknessPerpen: getMeasure(),
    mdLogSample: getMeasureWithDatum(),
    tvdLogSample: getMeasureWithDatum(),
    dip: getMeasure(),
    dipDirection: getMeasure(),
    lithostratigraphic: getStratigraphicStruct(),
    chronostratigraphic: getStratigraphicStruct(),
    description: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getMessage(overrides?: Partial<MessageObject>): MessageObject {
  return {
    ...getObjectOnWellbore(),
    messageText: "",
    dTim: "",
    typeMessage: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getMudLog(overrides?: Partial<MudLog>): MudLog {
  return {
    ...getObjectOnWellbore(),
    mudLogCompany: "",
    mudLogEngineers: "",
    objectGrowing: false,
    startMd: getMeasureWithDatum(),
    endMd: getMeasureWithDatum(),
    commonData: getCommonData(),
    ...overrides
  };
}

export function getRig(overrides?: Partial<Rig>): Rig {
  return {
    ...getObjectOnWellbore(),
    airGap: getMeasure(),
    approvals: "",
    classRig: "",
    dTimEndOp: "",
    dTimStartOp: "",
    emailAddress: "",
    faxNumber: "",
    manufacturer: "",
    nameContact: "",
    owner: "",
    ratingDrillDepth: getMeasure(),
    ratingWaterDepth: getMeasure(),
    registration: "",
    telNumber: "",
    typeRig: "",
    yearEntService: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getRisk(overrides?: Partial<RiskObject>): RiskObject {
  return {
    ...getObjectOnWellbore(),
    type: "",
    category: "",
    subCategory: "",
    extendCategory: "",
    affectedPersonnel: "",
    mdBitStart: getMeasure(),
    mdBitEnd: getMeasure(),
    severityLevel: "",
    probabilityLevel: "",
    summary: "",
    details: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getTrajectory(overrides?: Partial<Trajectory>): Trajectory {
  return {
    ...getObjectOnWellbore(),
    mdMin: 0,
    mdMax: 0,
    aziRef: "",
    dTimTrajStart: "",
    dTimTrajEnd: "",
    dateTimeCreation: "",
    dateTimeLastChange: "",
    trajectoryStations: [],
    ...overrides
  };
}

export function getTubular(overrides?: Partial<Tubular>): Tubular {
  return {
    ...getObjectOnWellbore(),
    typeTubularAssy: "",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getWbGeometry(overrides?: Partial<WbGeometryObject>): WbGeometryObject {
  return {
    ...getObjectOnWellbore(),
    dTimReport: "",
    mdBottom: getMeasure(),
    gapAir: getMeasure(),
    depthWaterMean: getMeasure(),
    commonData: getCommonData(),
    ...overrides
  };
}

const getObjectMapping = {
  [ObjectType.BhaRun]: getBhaRun,
  [ObjectType.ChangeLog]: getChangeLog,
  [ObjectType.FluidsReport]: getFluidsReport,
  [ObjectType.FormationMarker]: getFormationMarker,
  [ObjectType.Message]: getMessage,
  [ObjectType.MudLog]: getMudLog,
  [ObjectType.Log]: getLogObject,
  [ObjectType.Rig]: getRig,
  [ObjectType.Risk]: getRisk,
  [ObjectType.Trajectory]: getTrajectory,
  [ObjectType.Tubular]: getTubular,
  [ObjectType.WbGeometry]: getWbGeometry
};

export function getObject<T extends ObjectType>(objectType: T, overrides?: Partial<ObjectTypeToModel[T]>): ObjectTypeToModel[T] {
  return getObjectMapping[objectType](overrides) as ObjectTypeToModel[T];
}

export function getLogObject(overrides?: Partial<LogObject>): LogObject {
  return {
    ...getObjectOnWellbore(),
    indexType: "measured depth",
    startIndex: "0",
    endIndex: "1000",
    objectGrowing: false,
    serviceCompany: "serviceCompany",
    runNumber: "runNumber",
    indexCurve: "DEP",
    commonData: getCommonData(),
    ...overrides
  };
}

export function getCommonData(overrides?: Partial<CommonData>): CommonData {
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

export function getLogCurveInfo(overrides?: Partial<LogCurveInfo>): LogCurveInfo {
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
    sensorOffset: getMeasure(),
    ...overrides
  };
}

export function getMeasure(overrides?: Partial<Measure>): Measure {
  return {
    value: 0,
    uom: "m",
    ...overrides
  };
}

export function getMeasureWithDatum(overrides?: Partial<MeasureWithDatum>): MeasureWithDatum {
  return {
    value: 0,
    uom: "m",
    datum: "2000-01-01T08:00:00Z",
    ...overrides
  };
}

export function getStratigraphicStruct(overrides?: Partial<StratigraphicStruct>): StratigraphicStruct {
  return {
    value: "",
    kind: "",
    ...overrides
  };
}

export function getAxisDefinition(overrides?: Partial<AxisDefinition>): AxisDefinition {
  return {
    uid: "axisDefinitionUid",
    order: 1,
    count: 8,
    doubleValues: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16",
    ...overrides
  };
}
