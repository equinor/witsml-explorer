import { useEffect, useState } from "react";
import { DateTimeFormat, DecimalPreference, TimeZone, UserTheme } from "../contexts/operationStateReducer";
import { QueryState } from "../contexts/queryContext";
import { MissingDataCheck } from "../models/jobs/missingDataJob";

export const STORAGE_THEME_KEY = "selectedTheme";
export const STORAGE_TIMEZONE_KEY = "selectedTimeZone";
export const STORAGE_MODE_KEY = "selectedMode";
export const STORAGE_FILTER_HIDDENOBJECTS_KEY = "hiddenObjects";
export const STORAGE_MISSING_DATA_AGENT_CHECKS_KEY = "missingDataAgentChecks";
export const STORAGE_DATETIMEFORMAT_KEY = "selectedDateTimeFormat";
export const STORAGE_QUERYVIEW_DATA = "queryViewData";
export const STORAGE_DECIMAL_KEY = "decimalPrefernce";
export const STORAGE_KEEP_SERVER_CREDENTIALS = "-keepCredentials";
export const STORAGE_CONTENTTABLE_WIDTH_KEY = "-widths";
export const STORAGE_CONTENTTABLE_HIDDEN_KEY = "-hidden";
export const STORAGE_CONTENTTABLE_ORDER_KEY = "-ordering";

type StorageKey =
  | typeof STORAGE_THEME_KEY
  | typeof STORAGE_TIMEZONE_KEY
  | typeof STORAGE_MODE_KEY
  | typeof STORAGE_FILTER_HIDDENOBJECTS_KEY
  | typeof STORAGE_MISSING_DATA_AGENT_CHECKS_KEY
  | typeof STORAGE_DATETIMEFORMAT_KEY
  | typeof STORAGE_QUERYVIEW_DATA
  | typeof STORAGE_DECIMAL_KEY
  | typeof STORAGE_KEEP_SERVER_CREDENTIALS
  | typeof STORAGE_CONTENTTABLE_WIDTH_KEY
  | typeof STORAGE_CONTENTTABLE_HIDDEN_KEY
  | typeof STORAGE_CONTENTTABLE_ORDER_KEY;
type StorageKeyToType = {
  [STORAGE_THEME_KEY]: UserTheme;
  [STORAGE_TIMEZONE_KEY]: TimeZone;
  [STORAGE_MODE_KEY]: "light" | "dark";
  [STORAGE_FILTER_HIDDENOBJECTS_KEY]: string[];
  [STORAGE_MISSING_DATA_AGENT_CHECKS_KEY]: MissingDataCheck[];
  [STORAGE_DATETIMEFORMAT_KEY]: DateTimeFormat;
  [STORAGE_QUERYVIEW_DATA]: QueryState;
  [STORAGE_DECIMAL_KEY]: DecimalPreference;
  [STORAGE_KEEP_SERVER_CREDENTIALS]: string;
  [STORAGE_CONTENTTABLE_WIDTH_KEY]: { [label: string]: number };
  [STORAGE_CONTENTTABLE_HIDDEN_KEY]: string[];
  [STORAGE_CONTENTTABLE_ORDER_KEY]: string[];
};

export const getLocalStorageItem = <Key extends StorageKey>(key: Key, options?: storageOptions<Key>): StorageKeyToType[Key] | null => {
  const { preKey, defaultValue, valueVerifier } = options || {};
  const fullKey = preKey ? preKey + key : key;
  try {
    if (typeof window !== "undefined" && fullKey) {
      const item = localStorage.getItem(fullKey);
      const parsedItem = item ? JSON.parse(item) : null;
      if (valueVerifier) {
        return valueVerifier(parsedItem) ? parsedItem : defaultValue || null;
      }
      return parsedItem || defaultValue || null;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`Error parsing localStorage item for key “${fullKey}”. Removing the item from localStorage as the type might have changed.`, error);
      removeLocalStorageItem(key, options);
    } else {
      // disregard unavailable local storage
      console.warn(`Error getting localStorage item for key “${fullKey}”:`, error);
    }
  }
  return defaultValue || null;
};

export const setLocalStorageItem = <Key extends StorageKey>(key: Key, value: StorageKeyToType[Key], options?: storageOptions<Key>): void => {
  const { preKey, storageTransformer } = options || {};
  const fullKey = preKey ? preKey + key : key;
  try {
    if (typeof window !== "undefined" && fullKey) {
      const transformedValue = storageTransformer ? storageTransformer(value) : value;
      localStorage.setItem(fullKey, JSON.stringify(transformedValue));
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error setting localStorage item for key “${fullKey}”:`, error);
  }
};

export const removeLocalStorageItem = <Key extends StorageKey>(key: Key, options?: storageOptions<Key>): void => {
  const { preKey } = options || {};
  const fullKey = preKey ? preKey + key : key;
  try {
    if (typeof window !== "undefined" && fullKey) {
      localStorage.removeItem(fullKey);
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error removing localStorage key “${fullKey}”:`, error);
  }
};

/**
 * Interface for the options object that can be passed to the localStorage helper functions.
 *
 * @interface
 * @template Key - A key from the StorageKey enum.
 *
 * @property preKey - An optional prefix for the localStorage key.
 * @property defaultValue - An optional default value to use when the localStorage item is not found or an error occurs.
 * @property delay - An optional delay (in milliseconds) used to debounce the setting of the item. Only used by the useLocalStorageState hook.
 * @property valueVerifier - An optional function to verify the value retrieved from localStorage. If this function returns false, defaultValue or null will be used instead.
 * @property storageTransformer - An optional function to transform the value before it's stored in localStorage.
 */
export interface storageOptions<Key extends StorageKey> {
  preKey?: string;
  defaultValue?: StorageKeyToType[Key];
  delay?: number;
  valueVerifier?: (value: StorageKeyToType[Key]) => boolean;
  storageTransformer?: (value: StorageKeyToType[Key]) => StorageKeyToType[Key];
}

export const useLocalStorageState = <Key extends StorageKey>(
  key: Key,
  options?: storageOptions<Key>
): [StorageKeyToType[Key] | null, React.Dispatch<React.SetStateAction<StorageKeyToType[Key] | null>>] => {
  const { preKey, defaultValue, delay = 250 } = options || {};
  const [state, setState] = useState<StorageKeyToType[Key] | null>(() => {
    if (typeof window !== "undefined" && key) {
      return getLocalStorageItem(key, options);
    }
    return defaultValue || null;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && key) {
      const dispatch = setTimeout(() => {
        setLocalStorageItem(key, state, options);
      }, delay);
      return () => clearTimeout(dispatch);
    }
  }, [key, preKey, state]);

  return [state, setState];
};
