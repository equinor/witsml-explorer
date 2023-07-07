import { Checkbox, IconButton, useTheme } from "@material-ui/core";
import { ColumnDef, Row, SortingFn, Table } from "@tanstack/react-table";
import { useMemo } from "react";
import Icon from "../../../styles/Icons";
import { getFromStorage, orderingStorageKey, widthsStorageKey } from "./contentTableStorage";
import { activeId, calculateColumnWidth, componentSortingFn, expanderId, measureSortingFn, selectId, toggleRow } from "./contentTableUtils";
import { ContentTableColumn, ContentType } from "./tableParts";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SortingFns {
    [measureSortingFn]: SortingFn<unknown>;
    [componentSortingFn]: SortingFn<unknown>;
  }
}

export const useColumnDef = (viewId: string, columns: ContentTableColumn[], insetColumns: ContentTableColumn[], checkableRows: boolean) => {
  const isCompactMode = useTheme().props.MuiCheckbox?.size === "small";

  return useMemo(() => {
    const savedWidths = getFromStorage(viewId, widthsStorageKey);
    let columnDef: ColumnDef<any, any>[] = columns.map((column) => {
      return {
        id: column.label,
        accessorKey: column.property,
        header: column.label,
        size: savedWidths ? savedWidths[column.label] : calculateColumnWidth(column.label, isCompactMode, column.type),
        meta: { type: column.type },
        ...addComponentCell(column.type),
        ...addActiveCurveFiltering(column.label),
        ...addMeasureSorting(column.type)
      };
    });

    const savedOrder = getFromStorage(viewId, orderingStorageKey);
    if (savedOrder) {
      const sortedColumns = savedOrder.flatMap((label) => {
        const foundColumn = columnDef.find((col) => col.id == label);
        return foundColumn == null ? [] : foundColumn;
      });
      const columnsWithoutOrder = columnDef.filter((col) => !savedOrder.includes(col.id));
      columnDef = sortedColumns.concat(columnsWithoutOrder);
    }

    columnDef = [...(checkableRows ? [getCheckableRowsColumnDef(isCompactMode)] : []), ...(insetColumns ? [getExpanderColumnDef(isCompactMode)] : []), ...columnDef];
    return columnDef;
  }, [columns]);
};

const addActiveCurveFiltering = (columnLabel: string): Partial<ColumnDef<any, any>> => {
  return columnLabel == activeId
    ? {
        filterFn: (row) => row.original.isVisibleFunction(),
        cell: ({ row }) => {
          return row.original.isActive ? <Icon name="isActive" /> : "";
        },
        enableColumnFilter: true
      }
    : {};
};

const addComponentCell = (columnType: ContentType): Partial<ColumnDef<any, any>> => {
  return columnType == ContentType.Component
    ? {
        cell: (props) => props.getValue(),
        sortingFn: componentSortingFn
      }
    : {};
};

const addMeasureSorting = (contentType: ContentType): Partial<ColumnDef<any, any>> => {
  return contentType == ContentType.Measure
    ? {
        sortingFn: measureSortingFn
      }
    : {};
};

const getExpanderColumnDef = (isCompactMode: boolean): ColumnDef<any, any> => {
  return {
    id: expanderId,
    enableHiding: false,
    size: calculateColumnWidth(expanderId, isCompactMode),
    header: ({ table }: { table: Table<any> }) => (
      <IconButton onClick={() => table.toggleAllRowsExpanded(!table.getIsSomeRowsExpanded())} size="small" style={{ padding: 0 }}>
        <Icon name={table.getIsSomeRowsExpanded() ? "chevronUp" : "chevronDown"} style={{ color: table.options.meta.colors.infographic.primaryMossGreen }} />
      </IconButton>
    ),
    cell: ({ row, table }) => {
      return row.getCanExpand() ? (
        <div style={{ display: "flex" }}>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              row.getToggleExpandedHandler()();
            }}
            size="small"
            style={{ margin: "auto", padding: 0 }}
          >
            <Icon name={row.getIsExpanded() ? "chevronUp" : "chevronDown"} style={{ color: table.options.meta.colors.infographic.primaryMossGreen }} />
          </IconButton>
        </div>
      ) : (
        ""
      );
    }
  };
};

const getCheckableRowsColumnDef = (isCompactMode: boolean): ColumnDef<any, any> => {
  return {
    id: selectId,
    enableHiding: false,
    size: calculateColumnWidth(selectId, isCompactMode),
    header: ({ table }: { table: Table<any> }) => (
      <Checkbox checked={table.getIsAllRowsSelected()} indeterminate={table.getIsSomeRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />
    ),
    cell: ({ row, table }: { row: Row<any>; table: Table<any> }) => (
      <div style={{ display: "flex" }}>
        <Checkbox
          style={{ margin: "auto" }}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onClick={(event) => {
            toggleRow(event, row, table);
            event.stopPropagation();
          }}
          readOnly
        />
      </div>
    )
  };
};
