export const STORAGE_THEME_KEY = "selectedTheme";
export const STORAGE_TIMEZONE_KEY = "selectedTimeZone";
export const STORAGE_MODE_KEY = "selectedMode";
export const STORAGE_HOTKEYS_ENABLED_KEY = "hotKeysEnabled";
export const STORAGE_FILTER_HIDDENOBJECTS_KEY = "hiddenObjects";
export const STORAGE_FILTER_ISACTIVE_KEY = "filterIsActive";
export const STORAGE_FILTER_OBJECTGROWING_KEY = "filterObjectGrowing";
export const STORAGE_FILTER_UIDMAPPING_KEY = "filterUidMapping";
export const STORAGE_FILTER_PRIORITYSERVERS_KEY = "filterPriorityServers";
export const STORAGE_FILTER_INACTIVE_TIME_CURVES_KEY =
  "filterHideInactiveCurves";
export const STORAGE_FILTER_INACTIVE_TIME_CURVES_VALUE_KEY =
  "filterInactiveCurveTimeInMinutes";
export const STORAGE_MISSING_DATA_AGENT_CHECKS_KEY = "missingDataAgentChecks";
export const STORAGE_DATETIMEFORMAT_KEY = "selectedDateTimeFormat";
export const STORAGE_QUERYVIEW_DATA = "queryViewData";
export const STORAGE_DECIMAL_KEY = "decimalPrefernce";
export const STORAGE_KEEP_SERVER_CREDENTIALS = "-keepCredentials";
export const STORAGE_CONTENTTABLE_WIDTH_KEY = "-widths";
export const STORAGE_CONTENTTABLE_HIDDEN_KEY = "-hidden";
export const STORAGE_CONTENTTABLE_ORDER_KEY = "-ordering";

export const getLocalStorageItem = <T,>(
  key: string,
  options?: StorageOptions<T>
): T | null => {
  const { defaultValue, valueVerifier } = options || {};
  try {
    if (typeof window !== "undefined" && key) {
      const item = localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : null;
      if (valueVerifier) {
        return valueVerifier(parsedItem) ? parsedItem : defaultValue || null;
      }
      return parsedItem || defaultValue || null;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(
        `Error parsing localStorage item for key “${key}”. Removing the item from localStorage as the type might have changed.`,
        error
      );
      removeLocalStorageItem(key);
    } else {
      // disregard unavailable local storage
      console.warn(`Error getting localStorage item for key “${key}”:`, error);
    }
  }
  return defaultValue || null;
};

export const setLocalStorageItem = <T,>(
  key: string,
  value: T,
  options?: StorageOptions<T>
): void => {
  const { storageTransformer } = options || {};
  try {
    if (typeof window !== "undefined" && key) {
      const transformedValue = storageTransformer
        ? storageTransformer(value)
        : value;
      localStorage.setItem(key, JSON.stringify(transformedValue));
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error setting localStorage item for key “${key}”:`, error);
  }
};

export const removeLocalStorageItem = (key: string): void => {
  try {
    if (typeof window !== "undefined" && key) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error removing localStorage key “${key}”:`, error);
  }
};

/**
 * Interface for the options object that can be passed to the localStorage helper functions.
 *
 * @property defaultValue - An optional default value to use when the localStorage item is not found or an error occurs.
 * @property delay - An optional delay (in milliseconds) used to debounce the setting of the item. Only used by the useLocalStorageState hook.
 * @property valueVerifier - An optional function to verify the value retrieved from localStorage. If this function returns false, defaultValue or null will be used instead.
 * @property storageTransformer - An optional function to transform the value before it's stored in localStorage.
 */
export interface StorageOptions<T> {
  defaultValue?: T;
  delay?: number;
  valueVerifier?: (value: T) => boolean;
  storageTransformer?: (value: T) => T;
}
