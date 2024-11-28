import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ConnectedServerProvider } from "contexts/connectedServerContext";
import { CurveThresholdProvider } from "contexts/curveThresholdContext";
import { Filter, FilterContextProvider } from "contexts/filter";
import { LoggedInUsernamesProvider } from "contexts/loggedInUsernamesContext";
import OperationContext from "contexts/operationContext";
import {
  DateTimeFormat,
  DecimalPreference,
  EMPTY_CONTEXT_MENU,
  OperationState,
  TimeZone,
  UserTheme,
  reducer as operationReducer
} from "contexts/operationStateReducer";
import { QueryContextProvider, QueryState } from "contexts/queryContext";
import { SidebarProvider } from "contexts/sidebarContext";
import AxisDefinition from "models/AxisDefinition";
import BhaRun from "models/bhaRun";
import ChangeLog from "models/changeLog";
import CommonData from "models/commonData";
import FluidsReport from "models/fluidsReport";
import FormationMarker from "models/formationMarker";
import JobInfo from "models/jobs/jobInfo";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import Measure from "models/measure";
import MeasureWithDatum from "models/measureWithDatum";
import MessageObject from "models/messageObject";
import MudLog from "models/mudLog";
import ObjectOnWellbore from "models/objectOnWellbore";
import ObjectSearchResult from "models/objectSearchResult";
import { ObjectType, ObjectTypeToModel } from "models/objectType";
import RefNameString from "models/refNameString";
import BaseReport from "models/reports/BaseReport";
import Rig from "models/rig";
import RiskObject from "models/riskObject";
import { Server } from "models/server";
import StratigraphicStruct from "models/stratigraphicStruct";
import Trajectory from "models/trajectory";
import Tubular from "models/tubular";
import WbGeometryObject from "models/wbGeometry";
import Well, { emptyWell } from "models/well";
import Wellbore from "models/wellbore";
import { SnackbarProvider } from "notistack";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Notification } from "services/notificationService";
import { light } from "styles/Colors";
import { getTheme } from "styles/material-eds";

interface RenderWithContextsOptions {
  initialOperationState?: Partial<OperationState>;
  initialFilter?: Partial<Filter>;
  initialQueryState?: Partial<QueryState>;
  initialConnectedServer?: Server;
}

export function renderWithContexts(
  ui: React.ReactElement,
  {
    initialOperationState,
    initialFilter,
    initialQueryState,
    initialConnectedServer,
    ...options
  }: RenderWithContextsOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactElement }) => {
    const [operationState, dispatchOperation] = React.useReducer(
      operationReducer,
      {
        contextMenu: EMPTY_CONTEXT_MENU,
        progressIndicatorValue: 0,
        modals: [],
        theme: UserTheme.Compact,
        timeZone: TimeZone.Local,
        dateTimeFormat: DateTimeFormat.Raw,
        decimals: DecimalPreference.Raw,
        colors: light,
        hotKeysEnabled: false,
        ...initialOperationState
      }
    );
    const queryClient = new QueryClient();

    return (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <OperationContext.Provider
            value={{ operationState, dispatchOperation }}
          >
            <LoggedInUsernamesProvider>
              <ConnectedServerProvider
                initialConnectedServer={initialConnectedServer}
              >
                <CurveThresholdProvider>
                  <SidebarProvider>
                    <ThemeProvider theme={getTheme(operationState.theme)}>
                      <FilterContextProvider initialFilter={initialFilter}>
                        <QueryContextProvider
                          initialQueryState={initialQueryState}
                        >
                          <SnackbarProvider>{children}</SnackbarProvider>
                        </QueryContextProvider>
                      </FilterContextProvider>
                    </ThemeProvider>
                  </SidebarProvider>
                </CurveThresholdProvider>
              </ConnectedServerProvider>
            </LoggedInUsernamesProvider>
          </OperationContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

export class MockResizeObserver {
  observe() {
    /**/
  }
  unobserve() {
    /**/
  }
  disconnect() {
    /**/
  }
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve: (value?: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export function getServer(overrides?: Partial<Server>): Server {
  return {
    id: "serverId",
    name: "serverName",
    description: "serverDescription",
    url: "serverUrl",
    roles: [],
    credentialIds: [],
    depthLogDecimals: 0,
    isPriority: false,
    ...overrides
  };
}

export function getWell(overrides?: Partial<Well>): Well {
  return {
    ...emptyWell(),
    ...overrides
  };
}

export function getWellbore(overrides?: Partial<Wellbore>): Wellbore {
  return {
    name: "wellboreName",
    uid: "wellboreUid",
    wellName: "wellName",
    wellUid: "wellUid",
    ...overrides
  };
}

export function getJobInfo(overrides?: Partial<JobInfo>): JobInfo {
  return {
    jobType: "",
    description: "",
    id: "",
    username: "",
    witsmlTargetUsername: "",
    witsmlSourceUsername: "",
    sourceServer: "",
    targetServer: "",
    wellName: "",
    wellboreName: "",
    objectName: "",
    startTime: "",
    endTime: "",
    killTime: "",
    status: null,
    failedReason: "",
    progress: 0,
    isCancelable: false,
    reportType: null,
    ...overrides
  };
}

export function getReport(overrides?: Partial<BaseReport>): BaseReport {
  return {
    title: "testTitle",
    summary: "testSummary",
    reportItems: [],
    warningMessage: "",
    hasFile: false,
    ...overrides
  };
}

export function getNotification(
  overrides?: Partial<Notification>
): Notification {
  return {
    serverUrl: new URL("http://example.com"),
    isSuccess: true,
    message: "",
    ...overrides
  };
}

export function getObjectOnWellbore(
  overrides?: Partial<ObjectOnWellbore>
): ObjectOnWellbore {
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

export function getObjectSearchResult(
  overrides?: Partial<ObjectSearchResult>
): ObjectSearchResult {
  return {
    ...getObjectOnWellbore(),
    searchProperty: "searchProperty",
    objectType: ObjectType.Log,
    ...overrides
  };
}

export function getBhaRun(overrides?: Partial<BhaRun>): BhaRun {
  return {
    ...getObjectOnWellbore(),
    numStringRun: "",
    tubular: getRefNameString(),
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

export function getFluidsReport(
  overrides?: Partial<FluidsReport>
): FluidsReport {
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

export function getFormationMarker(
  overrides?: Partial<FormationMarker>
): FormationMarker {
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
    mdMin: getMeasureWithDatum(),
    mdMax: getMeasureWithDatum(),
    aziRef: "",
    dTimTrajStart: "",
    dTimTrajEnd: "",
    serviceCompany: "",
    commonData: getCommonData(),
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

export function getWbGeometry(
  overrides?: Partial<WbGeometryObject>
): WbGeometryObject {
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

export function getObject<T extends ObjectType>(
  objectType: T,
  overrides?: Partial<ObjectTypeToModel[T]>
): ObjectTypeToModel[T] {
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

export function getLogCurveInfo(
  overrides?: Partial<LogCurveInfo>
): LogCurveInfo {
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
    curveDescription: "curveDescription",
    typeLogData: "typeLogData",
    sensorOffset: getMeasure(),
    nullValue: "123",
    traceState: "raw",
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

export function getMeasureWithDatum(
  overrides?: Partial<MeasureWithDatum>
): MeasureWithDatum {
  return {
    value: 0,
    uom: "m",
    datum: "2000-01-01T08:00:00Z",
    ...overrides
  };
}

export function getStratigraphicStruct(
  overrides?: Partial<StratigraphicStruct>
): StratigraphicStruct {
  return {
    value: "",
    kind: "",
    ...overrides
  };
}

export function getRefNameString(
  overrides?: Partial<RefNameString>
): RefNameString {
  return {
    uidRef: "",
    value: "",
    ...overrides
  };
}

export function getAxisDefinition(
  overrides?: Partial<AxisDefinition>
): AxisDefinition {
  return {
    uid: "axisDefinitionUid",
    order: 1,
    count: 8,
    doubleValues: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16",
    ...overrides
  };
}
