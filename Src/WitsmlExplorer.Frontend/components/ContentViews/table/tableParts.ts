import {
  ExpandedState,
  FilterFn,
  RowSelectionState
} from "@tanstack/react-table";
import React from "react";

export interface ExportableContentTableColumn<T> extends ContentTableColumn {
  columnOf: T;
}

export interface ContentTableColumn {
  property: string;
  label: string;
  type: ContentType;
  filterFn?: FilterFn<any>;
  width?: number;
}

export interface ContentTableRow {
  id: string;
}

export interface ContentTableProps {
  columns: ContentTableColumn[];
  data: any[];
  onSelect?: (row: ContentTableRow) => void;
  onContextMenu?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    selectedItem: Record<string, any>,
    checkedItems: Record<string, any>[]
  ) => void;
  checkableRows?: boolean;
  onRowSelectionChange?: (rows: ContentTableRow[]) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  insetColumns?: ContentTableColumn[];
  nested?: boolean;
  nestedProperty?: string;
  panelElements?: React.ReactElement[];
  showPanel?: boolean;
  showRefresh?: boolean;
  stickyLeftColumns?: number; // how many columns should be sticky
  viewId?: string; //id that will be used to save view settings to local storage, or null if should not save
  downloadToCsvFileName?: string;
  initiallySelectedRows?: ContentTableRow[];
  rowSelection?: RowSelectionState; // Use this for a controlled row selection state
  expanded?: ExpandedState; // Use this for a controlled expanded state
  autoRefresh?: boolean;
  disableFilters?: boolean; // Hides the input-fields that can be used as user-specified column filters. Does not disable other provided filters.
}

export enum Order {
  Ascending = "asc",
  Descending = "desc"
}

export enum ContentType {
  String,
  Number,
  DateTime,
  Measure,
  Component
}
