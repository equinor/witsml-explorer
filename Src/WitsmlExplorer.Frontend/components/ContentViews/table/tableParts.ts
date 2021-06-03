import React from "react";

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
}

export enum Order {
  Ascending = "asc",
  Descending = "desc"
}

export enum ContentType {
  String,
  Number,
  Date,
  DateTime,
  Icon
}

export const getComparatorByColumn = (column: ContentTableColumn): [(row: any) => any, string] => {
  let comparator;
  switch (column.type) {
    case ContentType.Number:
      comparator = (row: any): number => Number(row[column.property]);
      break;
    case ContentType.Date:
      comparator = (row: any): Date => new Date(row[column.property]);
      break;
    case ContentType.DateTime:
      comparator = (row: any): Date => new Date(row[column.property]);
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
