import React from "react";
import { CurveSpecification } from "../../../models/logData";
import { indexToNumber } from "../../../models/logObject";
import { WITSML_INDEX_TYPE_DATE_TIME } from "../../Constants";
import { Inset } from "./Inset";

export interface ExportableContentTableColumn<T> extends ContentTableColumn {
  columnOf: T;
}

export interface ContentTableColumn {
  property: string;
  label: string;
  type: ContentType;
  format?: string;
}

export interface ContentTableRow {
  id: number;
}

export interface ContentTableProps {
  columns: ContentTableColumn[];
  data: any[];
  onSelect?: (row: ContentTableRow) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLElement, MouseEvent>, selectedItem: Record<string, any>, checkedItems: Record<string, any>[]) => void;
  checkableRows?: boolean;
  onRowSelectionChange?: (rows: ContentTableRow[], sortOrder: Order, sortedColumn: ContentTableColumn) => void;
  order?: Order;
  inset?: Inset;
  panelElements?: React.ReactElement[];
  showPanel?: boolean;
  showRefresh?: boolean;
  showTotalItems?: boolean;
  stickyLeftColumns?: boolean;
  viewId?: string; //id that will be used to save view settings to local storage, or null if should not save
}

export enum Order {
  Ascending = "asc",
  Descending = "desc"
}

export enum ContentType {
  String,
  Number,
  DateTime,
  Icon,
  Measure
}

export const selectId = "select";
export const expanderId = "expander";
export const activeId = "active"; //implemented specifically for LogCurveInfoListView, needs rework if other views will also use filtering
export const widthsStorageKey = "-widths";
export const hiddenStorageKey = "-hidden";
export const orderingStorageKey = "-ordering";
type StorageKey = typeof widthsStorageKey | typeof hiddenStorageKey | typeof orderingStorageKey;
type StorageKeyToPreference = {
  [widthsStorageKey]: { [label: string]: number };
  [hiddenStorageKey]: string[];
  [orderingStorageKey]: string[];
};

export const getColumnAlignment = (column: { type: ContentType }) => {
  return column.type === ContentType.Number || column.type == ContentType.Measure ? "right" : "left";
};

export const getComparatorByColumn = (column: ContentTableColumn): [(row: any) => any, string] => {
  let comparator;
  switch (column.type) {
    case ContentType.Number:
      comparator = (row: any): number => Number(row[column.property]);
      break;
    case ContentType.Measure:
      comparator = (row: any): number => Number(indexToNumber(row[column.property]));
      break;
    default:
      comparator = (row: any): string => row[column.property];
      break;
  }
  return [comparator, column.property];
};

export const getRowsInRange = (rows: ContentTableRow[], indexRange: number[]): ContentTableRow[] => {
  const [firstIndex, secondIndex] = indexRange;
  const needOffset = firstIndex <= secondIndex;
  const sortedRange = [...indexRange].sort((a, b) => a - b);
  return rows.slice(sortedRange[0], needOffset ? sortedRange[1] + 1 : sortedRange[1]);
};

export const updateCheckedRows = (checkedItems: ContentTableRow[], rangeToToggle: ContentTableRow[], check: boolean): ContentTableRow[] => {
  const checkedRowsOutsideRange = checkedItems.filter((row) => !rangeToToggle.find((r) => r.id === row.id));
  const checkedRows = check ? [...checkedRowsOutsideRange, ...rangeToToggle] : checkedRowsOutsideRange;
  return checkedRows;
};

export const getSelectedRange = (isShiftKeyDown: boolean, currentRow: ContentTableRow, data: ContentTableRow[], activeIndexRange: number[]): number[] => {
  const currentRowIndex = data.findIndex((r) => r.id === currentRow.id);
  const firstIndex: number = isShiftKeyDown && activeIndexRange.length !== 0 ? activeIndexRange[0] : currentRowIndex;

  const selectedRange = [firstIndex, isShiftKeyDown ? currentRowIndex : firstIndex];
  return selectedRange;
};

export const getCheckedRows = (currentRow: ContentTableRow, data: ContentTableRow[], selectedRange: number[], checkedContentItems: ContentTableRow[]): ContentTableRow[] => {
  const rowsInRange = getRowsInRange(data, selectedRange);
  const shouldCheck = checkedContentItems.findIndex((checkedItem) => checkedItem.id == currentRow.id) === -1;
  const checkedRows = updateCheckedRows(checkedContentItems, rowsInRange, shouldCheck);
  return checkedRows;
};

export const getProgressRange = (startIndex: string, endIndex: string, indexType: string) => {
  return indexType === WITSML_INDEX_TYPE_DATE_TIME
    ? {
        minIndex: new Date(startIndex).getTime(),
        maxIndex: new Date(endIndex).getTime()
      }
    : {
        minIndex: Number(startIndex),
        maxIndex: Number(endIndex)
      };
};

export const calculateProgress = (index: string, minIndex: number, maxIndex: number, indexType: string) => {
  const normalize = (value: number) => ((value - minIndex) * 100) / (maxIndex - minIndex);
  if (indexType === WITSML_INDEX_TYPE_DATE_TIME) {
    return normalize(new Date(index).getTime());
  } else {
    return normalize(Number(index));
  }
};

export const getColumnType = (curveSpecification: CurveSpecification) => {
  const isTimeMnemonic = (mnemonic: string) => ["time", "datetime", "date time"].indexOf(mnemonic.toLowerCase()) >= 0;
  if (isTimeMnemonic(curveSpecification.mnemonic)) {
    return ContentType.DateTime;
  }
  switch (curveSpecification.unit.toLowerCase()) {
    case "time":
    case "datetime":
      return ContentType.DateTime;
    case "unitless":
      return ContentType.String;
    default:
      return ContentType.Number;
  }
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

export const constantTableOptions = {
  enableColumnResizing: true,
  enableHiding: true,
  enableMultiRowSelection: true,
  enableSorting: true,
  enableSortingRemoval: true,
  enableColumnFilters: false,
  enableFilters: false,
  enableGlobalFilter: false,
  enableGrouping: false,
  enableMultiRemove: false,
  enableMultiSort: false,
  enablePinning: false,
  enableSubRowSelection: false
};

const sortingIconSize = 16;
export function calculateColumnWidth(label: string, isCompactMode: boolean, type?: ContentType): number {
  const padding = (isCompactMode ? 8 : 32) + sortingIconSize;
  switch (label) {
    case "name":
      return 220 + padding;
    case "uid":
      return 280 + padding;
    case selectId:
      return isCompactMode ? 36 : 60;
    case expanderId:
      return isCompactMode ? 40 : 60;
    case activeId:
      return 40 + padding;
    case "mnemonic":
      return 150 + padding;
  }

  const estimatedLabelLength = label.length * 8;
  if (type == ContentType.DateTime) {
    return Math.max(180, estimatedLabelLength) + padding;
  } else if (type == ContentType.Measure || type == ContentType.Number) {
    return Math.max(80, estimatedLabelLength) + padding;
  }
  return Math.max(estimatedLabelLength + padding, 100);
}
