import { Row, Table } from "@tanstack/react-table";
import { VirtualItem } from "@tanstack/react-virtual";
import { ContentType } from "components/ContentViews/table";
import React, { useEffect } from "react";

export const selectId = "select";
export const expanderId = "expander";
export const activeId = "active"; //implemented specifically for LogCurveInfoListView, needs rework if other views will also use filtering
export const measureSortingFn = "measure";
export const componentSortingFn = "component";
export const booleanSortingFn = "boolean";

export const constantTableOptions = {
  enableColumnResizing: true,
  enableHiding: true,
  enableMultiRowSelection: true,
  enableSorting: true,
  enableSortingRemoval: true,
  enableColumnFilters: true,
  enableFilters: true,
  enableGlobalFilter: false,
  enableGrouping: false,
  enableMultiRemove: false,
  enableMultiSort: false,
  enablePinning: false,
  enableSubRowSelection: false
};

const sortingIconSize = 16;

export function calculateColumnWidth(
  label: string,
  isCompactMode: boolean,
  type?: ContentType,
  isPrimaryNestedColumn?: boolean
): number {
  const padding =
    (isCompactMode ? 8 : 32) +
    (isPrimaryNestedColumn ? 150 : 0) +
    sortingIconSize;
  switch (label) {
    case "name":
    case "Name":
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

export const toggleRow = (
  e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
  currentRow: Row<any>,
  table: Table<any>
) => {
  const previousIndex = table.options.meta?.previousIndex;
  if (e.shiftKey && previousIndex != null) {
    const currentIndex = currentRow.index;
    const sortedRows = table.getSortedRowModel().rows;
    const sortedPreviousIndex = sortedRows.findIndex(
      (row) => previousIndex == row.index
    );
    const sortedCurrentIndex = sortedRows.findIndex(
      (row) => currentIndex == row.index
    );
    if (sortedPreviousIndex == -1 || sortedCurrentIndex == -1) {
      return;
    }
    const fromIndex = Math.min(sortedPreviousIndex, sortedCurrentIndex);
    const toIndex = Math.max(sortedPreviousIndex, sortedCurrentIndex);
    const newSelections: { [index: string]: boolean } = {};
    for (let i = fromIndex; i <= toIndex; i++) {
      newSelections[sortedRows[i].id ?? sortedRows[i].index] = true;
    }
    table.setRowSelection({
      ...newSelections,
      ...table.getState().rowSelection
    });
  } else {
    currentRow.toggleSelected();
  }
  table.options.meta?.setPreviousIndex(currentRow.index);
};

export function isClickable(
  onSelect: any,
  id: string,
  checkableRows: boolean
): boolean {
  return (
    (onSelect != null || checkableRows) && id != selectId && id != expanderId
  );
}

export function calculateRowHeight(
  row: Row<any>,
  headCellHeight: number,
  cellHeight: number
): number {
  if (row.getIsExpanded() && (row.original.inset?.length || 0) !== 0) {
    return (
      headCellHeight +
      cellHeight +
      cellHeight * (row.original.inset?.length ?? 0)
    );
  }
  return cellHeight;
}

export const useInitFilterFns = (table: Table<any>) => {
  useEffect(() => {
    table
      .getVisibleLeafColumns()
      .filter((col) => col.columnDef.filterFn != null)
      ?.forEach((col) => col.setFilterValue(null));
  }, [table]);
};

export const calculateHorizontalSpace = (
  columnItems: VirtualItem<HTMLDivElement>[],
  totalSize: number,
  stickyLeftColumns: number
) => {
  if (columnItems.length <= stickyLeftColumns) {
    return [0, 0];
  }
  const spaceRight = totalSize - columnItems[columnItems.length - 1].end;
  if (stickyLeftColumns > 0) {
    const spaceLeft =
      columnItems[stickyLeftColumns].start -
      columnItems[stickyLeftColumns - 1].start -
      columnItems[stickyLeftColumns - 1].size;
    return [spaceLeft, spaceRight];
  }
  return [columnItems[0].start, spaceRight];
};
