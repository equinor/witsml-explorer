import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { ThemeProvider } from "@material-ui/core";
import { AssetsLoader } from "components/AssetsLoader";
import ContextMenuPresenter from "components/ContextMenus/ContextMenuPresenter";
import { ErrorBoundary, ErrorFallback } from "components/ErrorBoundary";
import GlobalStyles from "components/GlobalStyles";
import ModalPresenter from "components/Modals/ModalPresenter";
import PageLayout from "components/PageLayout";
import RefreshHandler from "components/RefreshHandler";
import Routing from "components/Routing";
import AuthorizationManager from "components/Sidebar/AuthorizationManager";
import Snackbar from "components/Snackbar";
import { FilterContextProvider } from "contexts/filter";
import NavigationContext from "contexts/navigationContext";
import { initNavigationStateReducer } from "contexts/navigationStateReducer";
import OperationContext from "contexts/operationContext";
import {
  DateTimeFormat,
  DecimalPreference,
  SetDateTimeFormatAction,
  SetDecimalAction,
  SetModeAction,
  SetThemeAction,
  SetTimeZoneAction,
  TimeZone,
  UserTheme,
  initOperationStateReducer
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { QueryContextProvider } from "contexts/queryContext";
import { enableDarkModeDebug } from "debugUtils/darkModeDebug";
import { authRequest, msalEnabled, msalInstance } from "msal/MsalAuthProvider";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import React, { useEffect } from "react";
import { dark, light } from "styles/Colors";
import { getTheme } from "styles/material-eds";
import {
  STORAGE_DATETIMEFORMAT_KEY,
  STORAGE_DECIMAL_KEY,
  STORAGE_MODE_KEY,
  STORAGE_THEME_KEY,
  STORAGE_TIMEZONE_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

const Home = (): React.ReactElement => {
  const [operationState, dispatchOperation] = initOperationStateReducer();
  const [navigationState, dispatchNavigation] = initNavigationStateReducer();

  useEffect(() => {
    if (typeof localStorage != "undefined") {
      const localStorageTheme =
        getLocalStorageItem<UserTheme>(STORAGE_THEME_KEY);
      if (localStorageTheme) {
        const action: SetThemeAction = {
          type: OperationType.SetTheme,
          payload: localStorageTheme
        };
        dispatchOperation(action);
      }
      const storedTimeZone =
        getLocalStorageItem<TimeZone>(STORAGE_TIMEZONE_KEY);
      if (storedTimeZone) {
        const action: SetTimeZoneAction = {
          type: OperationType.SetTimeZone,
          payload: storedTimeZone
        };
        dispatchOperation(action);
      }
      const storedMode = getLocalStorageItem<"light" | "dark">(
        STORAGE_MODE_KEY
      );
      if (storedMode) {
        const action: SetModeAction = {
          type: OperationType.SetMode,
          payload: storedMode == "light" ? light : dark
        };
        dispatchOperation(action);
      }
      const storedDateTimeFormat = getLocalStorageItem(
        STORAGE_DATETIMEFORMAT_KEY
      ) as DateTimeFormat;
      if (storedDateTimeFormat) {
        const action: SetDateTimeFormatAction = {
          type: OperationType.SetDateTimeFormat,
          payload: storedDateTimeFormat
        };
        dispatchOperation(action);
      }
      const storedDecimals = getLocalStorageItem(
        STORAGE_DECIMAL_KEY
      ) as DecimalPreference;
      if (storedDecimals) {
        const action: SetDecimalAction = {
          type: OperationType.SetDecimal,
          payload: storedDecimals
        };
        dispatchOperation(action);
      }
    }
    if (process.env.NEXT_PUBLIC_DARK_MODE_DEBUG) {
      return enableDarkModeDebug(dispatchOperation);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MsalProvider instance={msalInstance}>
        {msalEnabled && (
          <MsalAuthenticationTemplate
            interactionType={InteractionType.Redirect}
            authenticationRequest={authRequest}
          />
        )}
        <OperationContext.Provider
          value={{ operationState, dispatchOperation }}
        >
          <ThemeProvider theme={getTheme(operationState.theme)}>
            <GlobalStyles colors={operationState.colors} />
            <Head>
              <title>WITSML Explorer</title>
              <link
                rel="icon"
                href={AssetsLoader.getAssetsRoot() + "/favicon.ico"}
              />
            </Head>
            <NavigationContext.Provider
              value={{ navigationState, dispatchNavigation }}
            >
              <FilterContextProvider>
                <QueryContextProvider>
                  <Routing />
                  <AuthorizationManager />
                  <RefreshHandler />
                  <SnackbarProvider>
                    <Snackbar />
                  </SnackbarProvider>
                  <PageLayout />
                  <ContextMenuPresenter />
                  <ModalPresenter />
                </QueryContextProvider>
              </FilterContextProvider>
            </NavigationContext.Provider>
          </ThemeProvider>
        </OperationContext.Provider>
      </MsalProvider>
    </ErrorBoundary>
  );
};

export default Home;
