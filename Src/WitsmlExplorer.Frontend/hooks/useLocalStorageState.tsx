import { useEffect, useState } from "react";
import {
  StorageOptions,
  getLocalStorageItem,
  setLocalStorageItem
} from "tools/localStorageHelpers";

/**
 * Custom hook that updates localStorage with the current state.
 *
 * @template T - The type of the state.
 * @param {string} key - The key under which the state will be stored in localStorage.
 * @param {StorageOptions<T>} [options] - Optional configuration.
 * @returns {[T | null, React.Dispatch<React.SetStateAction<T | null>>]} - The state and a function to update it.
 */
export const useLocalStorageState = <T,>(
  key: string,
  options?: StorageOptions<T>
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] => {
  const { defaultValue, delay = 250 } = options || {};
  const [state, setState] = useState<T | null>(() => {
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
  }, [key, state]);

  return [state, setState];
};
