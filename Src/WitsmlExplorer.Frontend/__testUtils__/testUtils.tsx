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
import CommonData from "../models/commonData";
import LogCurveInfo from "../models/logCurveInfo";
import LogObject from "../models/logObject";
import ObjectOnWellbore from "../models/objectOnWellbore";
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

function getAxisDefinition(overrides?: Partial<AxisDefinition>): AxisDefinition {
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

export { getAxisDefinition, getCommonData, getLogCurveInfo, getLogObject, getMeasure };
