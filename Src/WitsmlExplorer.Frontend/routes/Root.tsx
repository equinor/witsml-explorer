import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { ThemeProvider } from "@mui/material";
import { DesktopAppEventHandler } from "components/DesktopAppEventHandler";
import { HotKeyHandler } from "components/HotKeyHandler";
import { LoggedInUsernamesProvider } from "contexts/loggedInUsernamesContext";
import { SnackbarProvider } from "notistack";
import { useEffect } from "react";
import { isDesktopApp } from "tools/desktopAppHelpers";
import ContextMenuPresenter from "../components/ContextMenus/ContextMenuPresenter";
import GlobalStyles from "../components/GlobalStyles";
import ModalPresenter from "../components/Modals/ModalPresenter";
import PageLayout from "../components/PageLayout";
import RefreshHandler from "../components/RefreshHandler";
import { Snackbar } from "../components/Snackbar";
import { ConnectedServerProvider } from "../contexts/connectedServerContext";
import { CurveThresholdProvider } from "../contexts/curveThresholdContext";
import { FilterContextProvider } from "../contexts/filter";
import OperationContext from "../contexts/operationContext";
import {
  DateTimeFormat,
  DecimalPreference,
  SetDateTimeFormatAction,
  SetDecimalAction,
  SetHotKeysEnabledAction,
  SetModeAction,
  SetThemeAction,
  SetTimeZoneAction,
  TimeZone,
  UserTheme,
  initOperationStateReducer
} from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { QueryContextProvider } from "../contexts/queryContext";
import { SidebarProvider } from "../contexts/sidebarContext";
import { enableDarkModeDebug } from "../debugUtils/darkModeDebug";
import {
  authRequest,
  msalEnabled,
  msalInstance
} from "../msal/MsalAuthProvider";
import { dark, light } from "../styles/Colors";
import { getTheme } from "../styles/material-eds";
import {
  STORAGE_DATETIMEFORMAT_KEY,
  STORAGE_DECIMAL_KEY,
  STORAGE_HOTKEYS_ENABLED_KEY,
  STORAGE_MODE_KEY,
  STORAGE_THEME_KEY,
  STORAGE_TIMEZONE_KEY,
  getLocalStorageItem
} from "../tools/localStorageHelpers";

export default function Root() {
  const [operationState, dispatchOperation] = initOperationStateReducer();

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
      const storedDateTimeFormat = getLocalStorageItem<DateTimeFormat>(
        STORAGE_DATETIMEFORMAT_KEY
      );
      if (storedDateTimeFormat) {
        const action: SetDateTimeFormatAction = {
          type: OperationType.SetDateTimeFormat,
          payload: storedDateTimeFormat
        };
        dispatchOperation(action);
      }
      const storedDecimals =
        getLocalStorageItem<DecimalPreference>(STORAGE_DECIMAL_KEY);
      if (storedDecimals) {
        const action: SetDecimalAction = {
          type: OperationType.SetDecimal,
          payload: storedDecimals
        };
        dispatchOperation(action);
      }
      const storedHotKeysEnabled = getLocalStorageItem<boolean>(
        STORAGE_HOTKEYS_ENABLED_KEY
      );
      if (storedHotKeysEnabled != null) {
        const action: SetHotKeysEnabledAction = {
          type: OperationType.SetHotKeysEnabled,
          payload: storedHotKeysEnabled
        };
        dispatchOperation(action);
      }
    }
    if (import.meta.env.VITE_DARK_MODE_DEBUG) {
      return enableDarkModeDebug(dispatchOperation);
    }
  }, []);

  return (
    <MsalProvider instance={msalInstance}>
      {msalEnabled && (
        <MsalAuthenticationTemplate
          interactionType={InteractionType.Redirect}
          authenticationRequest={authRequest}
        />
      )}
      <OperationContext.Provider value={{ operationState, dispatchOperation }}>
        <ThemeProvider theme={getTheme(operationState.theme)}>
          <GlobalStyles colors={operationState.colors} />
          <LoggedInUsernamesProvider>
            <ConnectedServerProvider>
              <CurveThresholdProvider>
                <SidebarProvider>
                  <FilterContextProvider>
                    <QueryContextProvider>
                      {isDesktopApp() && <DesktopAppEventHandler />}
                      <HotKeyHandler />
                      <RefreshHandler />
                      <SnackbarProvider>
                        <Snackbar />
                      </SnackbarProvider>
                      <PageLayout />
                      <ContextMenuPresenter />
                      <ModalPresenter />
                    </QueryContextProvider>
                  </FilterContextProvider>
                </SidebarProvider>
              </CurveThresholdProvider>
            </ConnectedServerProvider>
          </LoggedInUsernamesProvider>
        </ThemeProvider>
      </OperationContext.Provider>
    </MsalProvider>
  );
}
