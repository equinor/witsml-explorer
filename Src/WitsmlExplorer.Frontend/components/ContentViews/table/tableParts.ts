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
