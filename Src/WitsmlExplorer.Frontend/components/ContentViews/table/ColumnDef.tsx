import { Checkbox, IconButton, useTheme } from "@material-ui/core";
import { ColumnDef, Row, SortingFn, Table } from "@tanstack/react-table";
import {
  activeId,
  calculateColumnWidth,
  componentSortingFn,
  expanderId,
  measureSortingFn,
  selectId,
  toggleRow
} from "components/ContentViews/table/contentTableUtils";
import {
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table/tableParts";
import OperationContext from "contexts/operationContext";
import { DecimalPreference } from "contexts/operationStateReducer";
import { useContext, useMemo } from "react";
import Icon from "styles/Icons";
import {
  STORAGE_CONTENTTABLE_ORDER_KEY,
  STORAGE_CONTENTTABLE_WIDTH_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

declare module "@tanstack/react-table" {
  interface SortingFns {
    [measureSortingFn]: SortingFn<unknown>;
    [componentSortingFn]: SortingFn<unknown>;
  }
}

export const useColumnDef = (
  viewId: string,
  columns: ContentTableColumn[],
  insetColumns: ContentTableColumn[],
  checkableRows: boolean,
  stickyLeftColumns: number
) => {
  const isCompactMode = useTheme().props.MuiCheckbox?.size === "small";

  const {
    operationState: { decimals }
  } = useContext(OperationContext);

  return useMemo(() => {
    const savedWidths = getLocalStorageItem<{ [label: string]: number }>(
      viewId + STORAGE_CONTENTTABLE_WIDTH_KEY
    );
    let columnDef: ColumnDef<any, any>[] = columns.map((column) => {
      const width =
        column.width ??
        savedWidths?.[column.label] ??
        calculateColumnWidth(column.label, isCompactMode, column.type);
      return {
        id: column.label,
        accessorKey: column.property,
        header: column.label,
        size: width,
        meta: { type: column.type },
        sortingFn: getSortingFn(column.type),
        enableColumnFilter: column.filterFn != null,
        filterFn: column.filterFn,
        ...addComponentCell(column.type),
        ...addActiveCurveFiltering(column.label),
        ...addDecimalPreference(column.type, decimals)
      };
    });

    const savedOrder = getLocalStorageItem<string[]>(
      viewId + STORAGE_CONTENTTABLE_ORDER_KEY
    );

    if (savedOrder) {
      const sortedColumns = savedOrder.flatMap((label) => {
        const foundColumn = columnDef.find((col) => col.id == label);
        return foundColumn == null ? [] : foundColumn;
      });
      const columnsWithoutOrder = columnDef.filter(
        (col) => !savedOrder.includes(col.id)
      );
      columnDef = sortedColumns.concat(columnsWithoutOrder);
    }

    columnDef = [
      ...(checkableRows ? [getCheckableRowsColumnDef(isCompactMode)] : []),
      ...(insetColumns ? [getExpanderColumnDef(isCompactMode)] : []),
      ...columnDef
    ];

    const firstToggleableIndex = Math.max(
      (checkableRows ? 1 : 0) + (insetColumns ? 1 : 0),
      stickyLeftColumns
    );

    for (let i = 0; i < firstToggleableIndex; i++) {
      columnDef[i].enableHiding = false;
    }

    return columnDef;
  }, [columns]);
};

const addActiveCurveFiltering = (
  columnLabel: string
): Partial<ColumnDef<any, any>> => {
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

const addComponentCell = (
  columnType: ContentType
): Partial<ColumnDef<any, any>> => {
  return columnType == ContentType.Component
    ? {
        cell: (props) => props.getValue(),
        sortingFn: componentSortingFn
      }
    : {};
};

const addDecimalPreference = (
  columnType: ContentType,
  decimals: DecimalPreference
): Partial<ColumnDef<any, any>> => {
  return (columnType === ContentType.Number ||
    columnType === ContentType.Measure) &&
    decimals !== DecimalPreference.Raw
    ? {
        cell: (props) => {
          const value = props.getValue();
          const match = value
            ? value.toString().match(/([\d.]+)\s*([^\d.]*)/)
            : null;
          if (!match) return value;
          const numericValue = parseFloat(match[1]);
          const units = match[2];
          return isNaN(numericValue)
            ? value
            : `${numericValue.toFixed(parseInt(decimals))} ${units}`;
        }
      }
    : {};
};

const getExpanderColumnDef = (isCompactMode: boolean): ColumnDef<any, any> => {
  return {
    id: expanderId,
    enableHiding: false,
    size: calculateColumnWidth(expanderId, isCompactMode),
    header: ({ table }: { table: Table<any> }) => (
      <IconButton
        onClick={() =>
          table.toggleAllRowsExpanded(!table.getIsSomeRowsExpanded())
        }
        size="small"
        style={{ padding: 0 }}
      >
        <Icon
          name={table.getIsSomeRowsExpanded() ? "chevronUp" : "chevronDown"}
          style={{
            color: table.options.meta.colors.infographic.primaryMossGreen
          }}
        />
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
            <Icon
              name={row.getIsExpanded() ? "chevronUp" : "chevronDown"}
              style={{
                color: table.options.meta.colors.infographic.primaryMossGreen
              }}
            />
          </IconButton>
        </div>
      ) : (
        ""
      );
    }
  };
};

const getCheckableRowsColumnDef = (
  isCompactMode: boolean
): ColumnDef<any, any> => {
  return {
    id: selectId,
    enableHiding: false,
    size: calculateColumnWidth(selectId, isCompactMode),
    header: ({ table }: { table: Table<any> }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
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

const getSortingFn = (contentType: ContentType) => {
  if (contentType == ContentType.Measure) {
    return measureSortingFn;
  } else if (contentType == ContentType.Number) {
    return "alphanumeric";
  }
  return "text";
};
