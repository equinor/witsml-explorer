import React from "react";

export interface ExportableContentTableColumn<T> extends ContentTableColumn {
  columnOf: T;
}

export interface ContentTableColumn {
  property: string;
  label: string;
  type: ContentType;
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
  insetColumns?: ContentTableColumn[];
  panelElements?: React.ReactElement[];
  showPanel?: boolean;
  showRefresh?: boolean;
  stickyLeftColumns?: number; // how many columns should be sticky
  viewId?: string; //id that will be used to save view settings to local storage, or null if should not save
  downloadToCsvFileName?: string;
  initiallySelectedRows?: ContentTableRow[];
  autoRefresh?: boolean;
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
