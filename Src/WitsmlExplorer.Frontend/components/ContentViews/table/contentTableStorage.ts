import { Table, VisibilityState } from "@tanstack/react-table";
import { useEffect } from "react";
import { useLocalStorageState } from "hooks/useLocalStorageState";
import {
  STORAGE_CONTENTTABLE_HIDDEN_KEY,
  STORAGE_CONTENTTABLE_WIDTH_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

export const useStoreWidthsEffect = (
  viewId: string | null,
  table: Table<any>
) => {
  const [, setWidths] = useLocalStorageState<{ [label: string]: number }>(
    viewId + STORAGE_CONTENTTABLE_WIDTH_KEY
  );
  useEffect(() => {
    if (viewId) {
      const widths = Object.assign(
        {},
        ...table
          .getLeafHeaders()
          .map((header) => ({ [header.id]: header.getSize() }))
      );
      if (viewId) setWidths(widths);
    }
  }, [table.getTotalSize()]);
};

export const useStoreVisibilityEffect = (
  viewId: string | null,
  columnVisibility: VisibilityState
) => {
  const [, setVisibility] = useLocalStorageState<string[]>(
    viewId + STORAGE_CONTENTTABLE_HIDDEN_KEY
  );
  useEffect(() => {
    if (viewId) {
      const hiddenColumns = Object.entries(columnVisibility).flatMap(
        ([columnId, isVisible]) => (isVisible ? [] : columnId)
      );
      if (viewId) setVisibility(hiddenColumns);
    }
  }, [columnVisibility]);
};

export const initializeColumnVisibility = (viewId: string | null) => {
  if (viewId == null) {
    return {};
  }
  const hiddenColumns = getLocalStorageItem<string[]>(
    viewId + STORAGE_CONTENTTABLE_HIDDEN_KEY
  );
  return hiddenColumns == null
    ? {}
    : Object.assign(
        {},
        ...hiddenColumns.map((hiddenColumn) => ({ [hiddenColumn]: false }))
      );
};
