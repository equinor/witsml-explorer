import OperationContext from "contexts/operationContext";
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
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { enableDarkModeDebug } from "debugUtils/darkModeDebug";
import { ReactNode, useEffect } from "react";
import { dark, light } from "styles/Colors";
import {
  STORAGE_DATETIMEFORMAT_KEY,
  STORAGE_DECIMAL_KEY,
  STORAGE_HOTKEYS_ENABLED_KEY,
  STORAGE_MODE_KEY,
  STORAGE_THEME_KEY,
  STORAGE_TIMEZONE_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

interface OperationStateProviderProps {
  children: ReactNode;
}

export const OperationStateProvider = ({
  children
}: OperationStateProviderProps) => {
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
    <OperationContext.Provider value={{ operationState, dispatchOperation }}>
      {children}
    </OperationContext.Provider>
  );
};
