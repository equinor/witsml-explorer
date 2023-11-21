import { Table, VisibilityState } from "@tanstack/react-table";
import { useEffect } from "react";
import { STORAGE_CONTENTTABLE_HIDDEN_KEY, STORAGE_CONTENTTABLE_WIDTH_KEY, getLocalStorageItem, useLocalStorageState } from "../../../tools/localStorageHelpers";

export const useStoreWidthsEffect = (viewId: string | null, table: Table<any>) => {
  const [, setWidths] = useLocalStorageState(STORAGE_CONTENTTABLE_WIDTH_KEY, { preKey: viewId });
  useEffect(() => {
    if (viewId) {
      const widths = Object.assign({}, ...table.getLeafHeaders().map((header) => ({ [header.id]: header.getSize() })));
      if (viewId) setWidths(widths);
    }
  }, [table.getTotalSize()]);
};

export const useStoreVisibilityEffect = (viewId: string | null, columnVisibility: VisibilityState) => {
  const [, setVisibility] = useLocalStorageState(STORAGE_CONTENTTABLE_HIDDEN_KEY, { preKey: viewId });
  useEffect(() => {
    if (viewId) {
      const hiddenColumns = Object.entries(columnVisibility).flatMap(([columnId, isVisible]) => (isVisible ? [] : columnId));
      if (viewId) setVisibility(hiddenColumns);
    }
  }, [columnVisibility]);
};

export const initializeColumnVisibility = (viewId: string | null) => {
  if (viewId == null) {
    return {};
  }
  const hiddenColumns = getLocalStorageItem(STORAGE_CONTENTTABLE_HIDDEN_KEY, { preKey: viewId });
  return hiddenColumns == null ? {} : Object.assign({}, ...hiddenColumns.map((hiddenColumn) => ({ [hiddenColumn]: false })));
};
