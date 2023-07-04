import { Table, VisibilityState } from "@tanstack/react-table";
import { useEffect } from "react";

export const widthsStorageKey = "-widths";
const hiddenStorageKey = "-hidden";
export const orderingStorageKey = "-ordering";
type StorageKey = typeof widthsStorageKey | typeof hiddenStorageKey | typeof orderingStorageKey;
type StorageKeyToPreference = {
  [widthsStorageKey]: { [label: string]: number };
  [hiddenStorageKey]: string[];
  [orderingStorageKey]: string[];
};

export function saveToStorage<Key extends StorageKey>(viewId: string | null, storageKey: Key, preference: StorageKeyToPreference[Key]): void {
  try {
    if (viewId != null) {
      localStorage.setItem(viewId + storageKey, JSON.stringify(preference));
    }
  } catch {
    // disregard unavailable local storage
  }
}

export function getFromStorage<Key extends StorageKey>(viewId: string | null, storageKey: Key): StorageKeyToPreference[Key] | null {
  try {
    if (viewId != null) {
      return JSON.parse(localStorage.getItem(viewId + storageKey));
    }
  } catch {
    return null;
  }
}

export function removeFromStorage<Key extends StorageKey>(viewId: string | null, storageKey: Key): void {
  try {
    if (viewId != null) {
      localStorage.removeItem(viewId + storageKey);
    }
  } catch {
    // disregard unavailable local storage
  }
}

export const useStoreWidthsEffect = (viewId: string | null, table: Table<any>) => {
  useEffect(() => {
    const dispatch = setTimeout(() => {
      if (viewId != null) {
        const widths = Object.assign({}, ...table.getLeafHeaders().map((header) => ({ [header.id]: header.getSize() })));
        saveToStorage(viewId, widthsStorageKey, widths);
      }
    }, 400);
    return () => clearTimeout(dispatch);
  }, [table.getTotalSize()]);
};

export const useStoreVisibilityEffect = (viewId: string | null, columnVisibility: VisibilityState) => {
  useEffect(() => {
    if (viewId != null) {
      const hiddenColumns = Object.entries(columnVisibility).flatMap(([columnId, isVisible]) => (isVisible ? [] : columnId));
      saveToStorage(viewId, hiddenStorageKey, hiddenColumns);
    }
  }, [columnVisibility]);
};

export const initializeColumnVisibility = (viewId: string | null) => {
  if (viewId == null) {
    return {};
  }
  const hiddenColumns = getFromStorage(viewId, hiddenStorageKey);
  return hiddenColumns == null ? {} : Object.assign({}, ...hiddenColumns.map((hiddenColumn) => ({ [hiddenColumn]: false })));
};
