import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { ThemeProvider } from "@material-ui/core";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import React, { useEffect } from "react";
import { AssetsLoader } from "../components/AssetsLoader";
import { STORAGE_DATETIMEFORMAT_KEY, STORAGE_MODE_KEY, STORAGE_THEME_KEY, STORAGE_TIMEZONE_KEY } from "../components/Constants";
import ContextMenuPresenter from "../components/ContextMenus/ContextMenuPresenter";
import { ErrorBoundary, ErrorFallback } from "../components/ErrorBoundary";
import GlobalStyles from "../components/GlobalStyles";
import ModalPresenter from "../components/Modals/ModalPresenter";
import PageLayout from "../components/PageLayout";
import RefreshHandler from "../components/RefreshHandler";
import Routing from "../components/Routing";
import AuthorizationManager from "../components/Sidebar/AuthorizationManager";
import Snackbar from "../components/Snackbar";
import { FilterContextProvider } from "../contexts/filter";
import NavigationContext from "../contexts/navigationContext";
import { initNavigationStateReducer } from "../contexts/navigationStateReducer";
import OperationContext from "../contexts/operationContext";
import { DateTimeFormat, SetDateTimeFormatAction, SetModeAction, SetThemeAction, SetTimeZoneAction, TimeZone, UserTheme, initOperationStateReducer } from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { enableDarkModeDebug } from "../debugUtils/darkModeDebug";
import { authRequest, msalEnabled, msalInstance } from "../msal/MsalAuthProvider";
import { dark, light } from "../styles/Colors";
import { getTheme } from "../styles/material-eds";

const Home = (): React.ReactElement => {
  const [operationState, dispatchOperation] = initOperationStateReducer();
  const [navigationState, dispatchNavigation] = initNavigationStateReducer();

  useEffect(() => {
    if (typeof localStorage != "undefined") {
      const localStorageTheme = localStorage.getItem(STORAGE_THEME_KEY) as UserTheme;
      if (localStorageTheme) {
        const action: SetThemeAction = { type: OperationType.SetTheme, payload: localStorageTheme };
        dispatchOperation(action);
      }
      const storedTimeZone = localStorage.getItem(STORAGE_TIMEZONE_KEY) as TimeZone;
      if (storedTimeZone) {
        const action: SetTimeZoneAction = { type: OperationType.SetTimeZone, payload: storedTimeZone };
        dispatchOperation(action);
      }
      const storedMode = localStorage.getItem(STORAGE_MODE_KEY) as "light" | "dark";
      if (storedMode) {
        const action: SetModeAction = { type: OperationType.SetMode, payload: storedMode == "light" ? light : dark };
        dispatchOperation(action);
      }
      const storedDateTimeFormat = localStorage.getItem(STORAGE_DATETIMEFORMAT_KEY) as DateTimeFormat;
      if (storedDateTimeFormat) {
        const action: SetDateTimeFormatAction = { type: OperationType.SetDateTimeFormat, payload: storedDateTimeFormat };
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
        {msalEnabled && <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest} />}
        <OperationContext.Provider value={{ operationState, dispatchOperation }}>
          <ThemeProvider theme={getTheme(operationState.theme)}>
            <GlobalStyles colors={operationState.colors} />
            <Head>
              <title>WITSML Explorer</title>
              <link rel="icon" href={AssetsLoader.getAssetsRoot() + "/favicon.ico"} />
            </Head>
            <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
              <FilterContextProvider>
                <Routing />
                <AuthorizationManager />
                <RefreshHandler />
                <SnackbarProvider>
                  <Snackbar />
                </SnackbarProvider>
                <PageLayout />
                <ContextMenuPresenter />
                <ModalPresenter />
              </FilterContextProvider>
            </NavigationContext.Provider>
          </ThemeProvider>
        </OperationContext.Provider>
      </MsalProvider>
    </ErrorBoundary>
  );
};

export default Home;
