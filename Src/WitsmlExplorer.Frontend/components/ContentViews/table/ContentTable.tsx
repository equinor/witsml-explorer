import { Checkbox, IconButton, TableBody, TableCell, TableHead, useTheme } from "@material-ui/core";
import {
  ColumnDef,
  Header,
  Row,
  SortDirection,
  SortingFns,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { Fragment, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { indexToNumber } from "../../../models/logObject";
import { colors } from "../../../styles/Colors";
import Icon from "../../../styles/Icons";
import Panel from "./Panel";
import {
  ContentTableColumn,
  ContentTableProps,
  ContentType,
  activeId,
  calculateColumnWidth,
  constantTableOptions,
  expanderId,
  getFromStorage,
  hiddenStorageKey,
  orderingStorageKey,
  saveToStorage,
  selectId,
  widthsStorageKey
} from "./tableParts";

const initializeColumnVisibility = (viewId: string | null) => {
  if (viewId == null) {
    return {};
  }
  const hiddenColumns = getFromStorage(viewId, hiddenStorageKey);
  return hiddenColumns == null ? {} : Object.assign({}, ...hiddenColumns.map((hiddenColumn) => ({ [hiddenColumn]: false })));
};

export const ContentTable = (contentTableProps: ContentTableProps): React.ReactElement => {
  const {
    columns,
    data,
    onSelect,
    onContextMenu,
    checkableRows,
    onRowSelectionChange,
    insetColumns,
    panelElements,
    showPanel = true,
    showRefresh = false,
    stickyLeftColumns = false,
    viewId
  } = contentTableProps;
  const [activeIndex, setActiveIndex] = useState<number>(null);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState(initializeColumnVisibility(viewId));
  const isCompactMode = useTheme().props.MuiCheckbox?.size === "small";
  const cellHeight = isCompactMode ? 30 : 53;
  const headCellHeight = isCompactMode ? 35 : 55;

  const selectRow = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: Row<any>, table: Table<any>) => {
    if (onSelect) {
      onSelect(currentRow.original);
    } else if (checkableRows) {
      toggleRow(e, currentRow, table);
    }
  };

  const toggleRow = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: Row<any>, table: Table<any>) => {
    if (e.shiftKey && activeIndex != null) {
      const fromIndex = Math.min(activeIndex, currentRow.index);
      const toIndex = Math.max(activeIndex, currentRow.index);
      const rows = table.getSortedRowModel().rows;
      const sortedFromIndex = rows.findIndex((row) => fromIndex == row.index);
      if (sortedFromIndex == -1) {
        return;
      }
      const newSelections: any = {};
      let sortedCurrentIndex = sortedFromIndex;
      while (sortedCurrentIndex < rows.length) {
        const currentIndex = rows[sortedCurrentIndex].index;
        newSelections[currentIndex] = true;
        if (currentIndex == toIndex) {
          break;
        }
        sortedCurrentIndex += 1;
      }
      setRowSelection({ ...newSelections, ...rowSelection });
    } else {
      currentRow.toggleSelected();
    }
    setActiveIndex(currentRow.index);
  };

  const columnDef = useMemo(() => {
    const savedWidths = getFromStorage(viewId, widthsStorageKey);
    let columnDef: ColumnDef<any, any>[] = columns.map((column) => {
      return {
        id: column.label,
        accessorKey: column.property,
        header: column.label,
        size: savedWidths ? savedWidths[column.label] : calculateColumnWidth(column.label, isCompactMode, column.type),
        enableColumnFilter: true,
        meta: { type: column.type },
        ...(column.label == activeId
          ? {
              filterFn: (row) => row.original.isVisibleFunction(),
              cell: ({ row }) => {
                return row.original.isActive ? <Icon name="isActive" /> : "";
              }
            }
          : {}),
        ...(column.type == ContentType.Measure
          ? {
              sortingFn: "measure" as keyof SortingFns
            }
          : {})
      };
    });
    const savedOrder = getFromStorage(viewId, orderingStorageKey);
    //can extract this into a function and write a test
    if (savedOrder) {
      const sortedColumns = savedOrder.flatMap((label) => {
        const foundColumn = columnDef.find((col) => col.id == label);
        return foundColumn == null ? [] : foundColumn;
      });
      const columnsWithoutOrder = columnDef.filter((col) => !savedOrder.includes(col.id));
      columnDef = sortedColumns.concat(columnsWithoutOrder);
    }

    if (insetColumns != null) {
      columnDef = [
        {
          id: expanderId,
          enableHiding: false,
          size: calculateColumnWidth(expanderId, isCompactMode),
          header: ({ table }: { table: Table<any> }) => (
            <IconButton onClick={() => table.toggleAllRowsExpanded(!table.getIsSomeRowsExpanded())} size="small" style={{ padding: 0 }}>
              <Icon name={table.getIsSomeRowsExpanded() ? "chevronUp" : "chevronDown"} />
            </IconButton>
          ),
          cell: ({ row }) => {
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
                  <Icon name={row.getIsExpanded() ? "chevronUp" : "chevronDown"} />
                </IconButton>
              </div>
            ) : (
              ""
            );
          }
        },
        ...columnDef
      ];
    }
    if (checkableRows) {
      columnDef = [
        {
          id: selectId,
          enableHiding: false,
          size: calculateColumnWidth(selectId, isCompactMode),
          header: ({ table }: { table: Table<any> }) => (
            <Checkbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler()
              }}
            />
          ),
          cell: ({ row, table }: { row: Row<any>; table: Table<any> }) => (
            <div style={{ display: "flex" }}>
              <Checkbox
                style={{ margin: "auto" }}
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  onClick: (event) => {
                    toggleRow(event, row, table);
                    event.stopPropagation();
                  },
                  readOnly: true
                }}
              />
            </div>
          )
        },
        ...columnDef
      ];
    }
    return columnDef;
  }, [columns]);

  const table = useReactTable({
    data: data ?? [],
    columns: columnDef,
    state: {
      rowSelection,
      columnVisibility
    },
    sortingFns: {
      measure: (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
        const a = indexToNumber(rowA.getValue(columnId));
        const b = indexToNumber(rowB.getValue(columnId));
        return a > b ? -1 : a < b ? 1 : 0;
      }
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: insetColumns != null ? (row) => !!row.original.inset?.length : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableExpanding: insetColumns != null,
    enableRowSelection: checkableRows,
    ...constantTableOptions
  });

  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(
        table.getSelectedRowModel().rows.map((row) => row.original),
        null,
        null
      );
    }
  }, [rowSelection]);

  useEffect(() => {
    if (viewId != null) {
      const hiddenColumns = Object.entries(columnVisibility).flatMap(([columnId, isVisible]) => (isVisible ? [] : columnId));
      saveToStorage(viewId, hiddenStorageKey, hiddenColumns);
    }
  }, [columnVisibility]);

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: table.getRowModel().rows.length,
    overscan: 5,
    estimateSize: () => cellHeight
  });

  useEffect(() => {
    //use debounce
    if (viewId != null) {
      const widths = Object.assign({}, ...table.getLeafHeaders().map((header) => ({ [header.id]: header.getSize() })));
      saveToStorage(viewId, widthsStorageKey, widths);
    }
  }, [table.getTotalSize()]);

  useEffect(() => {
    table
      .getVisibleLeafColumns()
      .find((col) => col.columnDef.id == activeId)
      ?.setFilterValue(false);
  }, [table]);

  const onRowContextMenu = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: Row<any>) => {
    if (onContextMenu) {
      onContextMenu(
        e,
        row.original,
        table.getSelectedRowModel().flatRows.map((r) => r.original)
      );
    }
  };

  const onHeaderClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, header: Header<any, unknown>) => {
    if (header.column.getCanSort()) {
      header.column.getToggleSortingHandler()(e);
      //collapse all rows to avoid wrong height calculations when sorting expanded rows
      table.toggleAllRowsExpanded(false);
      rowVirtualizer.measure();
    }
  };

  return (
    <TableContainer showPanel={showPanel}>
      {showPanel ? (
        <Panel
          checkableRows={checkableRows}
          panelElements={panelElements}
          numberOfCheckedItems={Object.keys(rowSelection).length} //these two can be computed from table prop
          numberOfItems={data?.length}
          table={table}
          viewId={viewId}
          columns={columns}
          expandableRows={insetColumns != null}
          showRefresh={showRefresh}
        />
      ) : null}
      <div ref={tableContainerRef} style={{ overflowY: "auto", height: "100%" }}>
        <StyledTable>
          <TableHead
            style={{
              position: "sticky",
              top: 0,
              zIndex: insetColumns != null ? 2 : 1
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ display: "flex" }}>
                {headerGroup.headers.map((header) => (
                  <StyledTh key={header.id} style={{ width: header.getSize() }} sticky={stickyLeftColumns ? 1 : 0}>
                    <div role="button" style={{ cursor: "pointer" }} onClick={(e) => onHeaderClick(e, header)}>
                      {header.column.getIsSorted() && sortingIcons[header.column.getIsSorted() as SortDirection]}
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.id != selectId && header.id != expanderId && <Resizer header={header} />}
                  </StyledTh>
                ))}
              </tr>
            ))}
          </TableHead>
          <TableBody style={{ height: rowVirtualizer.getTotalSize() + "px", position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<any>;
              return (
                <Fragment key={row.id}>
                  <StyledTr
                    selected={row.getIsSelected()}
                    onContextMenu={(e) => onRowContextMenu(e, row)}
                    style={{
                      height: `${calculateRowHeight(row, headCellHeight, cellHeight)}px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const clickable = isClickable(onSelect, cell.column.id, checkableRows);
                      return (
                        <StyledTd
                          key={cell.id}
                          style={{ width: cell.column.getSize(), left: cell.column.getStart() }}
                          onClick={clickable ? (event) => selectRow(event, row, table) : undefined}
                          clickable={clickable ? 1 : 0}
                          sticky={stickyLeftColumns ? 1 : 0}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </StyledTd>
                      );
                    })}
                  </StyledTr>
                  {row.getIsExpanded() && row.original.inset?.length != 0 && (
                    <Inset parentStart={virtualRow.start} cellHeight={cellHeight} headCellHeight={headCellHeight} data={row.original.inset} columns={insetColumns} />
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </StyledTable>
      </div>
    </TableContainer>
  );
};

const sortingIcons = {
  asc: <Icon size={16} name="arrowUp" style={{ position: "relative", top: 3 }} />,
  desc: <Icon size={16} name="arrowDown" style={{ position: "relative", top: 3 }} />
};

function isClickable(onSelect: any, id: string, checkableRows: boolean): boolean {
  return (onSelect != null || checkableRows) && id != selectId && id != expanderId;
}

function calculateRowHeight(row: Row<any>, headCellHeight: number, cellHeight: number): number {
  if (row.getIsExpanded() && row.original.inset?.length != 0) {
    return headCellHeight + cellHeight + cellHeight * row.original.inset?.length ?? 0;
  }
  return cellHeight;
}

const Resizer = (props: { header: Header<any, unknown> }): React.ReactElement => {
  const { header } = props;
  return (
    <StyledResizer
      {...{
        onMouseDown: (event) => {
          header.getResizeHandler()(event);
          event.stopPropagation();
        },
        onTouchStart: (event) => {
          header.getResizeHandler()(event);
          event.stopPropagation();
        },
        isResizing: header.column.getIsResizing()
      }}
    />
  );
};

interface InsetProps {
  parentStart: number;
  cellHeight: number;
  headCellHeight: number;
  data: any[];
  columns: ContentTableColumn[];
}

const Inset = (props: InsetProps): React.ReactElement => {
  const { parentStart, cellHeight, headCellHeight, data, columns } = props;
  return (
    <tr
      style={{
        position: "absolute",
        background: "white",
        width: "100%",
        top: `${parentStart + cellHeight}px`,
        left: 0,
        border: 0
      }}
    >
      <td
        style={{
          height: `${cellHeight * data.length + headCellHeight}px`,
          padding: 0
        }}
      >
        <ContentTable columns={columns} data={data} showPanel={false} />
      </td>
    </tr>
  );
};

const TableContainer = styled.div<{ showPanel?: boolean }>`
  overflow-y: auto;
  height: 100%;
  ${(props) =>
    props.showPanel
      ? `
    display: grid;
    grid-template-rows: 50px 1fr;
  `
      : ""}
`;

const StyledTable = styled.table`
  width: 100%;
  border-spacing: 0;
`;

const StyledResizer = styled.div<{ isResizing?: boolean }>`
  right: 0;
  top: 0;
  position: absolute;
  height: 100%;
  width: 7px;
  background: rgba(0, 0, 0, 0.5);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  opacity: 0;
  ${(props) =>
    props.isResizing
      ? `&{
    background: ${colors.infographic.primaryMossGreen};
    opacity: 1;
  }`
      : ""}
  &:hover {
    opacity: 1;
  }
`;

const StyledTr = styled.tr<{ selected?: boolean }>`
  display: flex;
  width: fit-content;
  position: absolute;
  top: 0;
  left: 0;
  &&& {
    background-color: ${(props) => (props.selected ? colors.interactive.textHighlight : "white")};
  }
  &&&:nth-of-type(even) {
    background-color: ${(props) => (props.selected ? colors.interactive.textHighlight : colors.interactive.tableHeaderFillResting)};
  }
  &&&:hover {
    background-color: ${colors.interactive.tableCellFillActivated};
  }
`;

const StyledTh = styled(TableCell)<{ sticky?: number }>`
  && {
    border-right: 1px solid rgba(224, 224, 224, 1);
    border-bottom-width: 2px;
    background-color: ${colors.interactive.tableHeaderFillResting};
    color: ${colors.text.staticIconsDefault};
    text-align: center;
    font-family: EquinorMedium, Arial, sans-serif;
    position: relative;
  }
  > div {
    font-feature-settings: "tnum";
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ${(props) => (props.sticky ? "&:nth-child(1) { position: sticky; z-index: 3; } &:nth-child(2) { position: sticky; z-index: 3; }" : "")}
`;

const StyledTd = styled(TableCell)<{ clickable?: number; sticky?: number }>`
  border-right: 1px solid rgba(224, 224, 224, 1);
  background-color: inherit;
  z-index: 0;
  && {
    color: ${colors.text.staticIconsDefault};
    font-family: EquinorMedium;
  }
  cursor: ${(props) => (props.clickable ? "pointer" : "arrow")};
  font-feature-settings: "tnum";
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${(props) => (props.sticky ? "&:nth-child(1) { position: sticky; z-index: 2; } &:nth-child(2) { position: sticky; z-index: 2; }" : "")}
`;
