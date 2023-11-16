export const getLocalStorageItem = (key: string): string => {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error getting localStorage item for key “${key}”:`, error);
    return null;
  }
};

export const setLocalStorageItem = (key: string, value: string): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error setting localStorage item for key “${key}”:`, error);
  }
};

export const removeLocalStorageItem = (key: string): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch (error) {
    // disregard unavailable local storage
    console.warn(`Error removing localStorage key “${key}”:`, error);
  }
};
