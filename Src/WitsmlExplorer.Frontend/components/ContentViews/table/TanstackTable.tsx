import { Icon } from "@equinor/eds-core-react";
import { Checkbox, IconButton, TableBody, TableCell, TableHead, useTheme } from "@material-ui/core";
import { ColumnDef, Row, Table, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { Fragment, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { colors } from "../../../styles/Colors";
import Panel from "./Panel";
import {
  ContentTableProps,
  activeId,
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

/* eslint-disable react/prop-types */
export const TanstackTable = (props: ContentTableProps): React.ReactElement => {
  const { data, columns, onSelect, onContextMenu, checkableRows, panelElements, onRowSelectionChange, inset, showTotalItems = true, stickyLeftColumns = false, viewId } = props;
  const [activeIndex, setActiveIndex] = useState<number>(null);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState(initializeColumnVisibility(viewId));
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const cellHeight = isCompactMode ? 30 : 53;
  const headCellHeight = isCompactMode ? 35 : 55;

  const selectRow = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: Row<any>, table: Table<any>) => {
    if (onSelect) {
      onSelect(currentRow.original);
    } else {
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
        size: savedWidths?.[column.label],
        enableColumnFilter: true,
        meta: { type: column.type }, //will I use it?
        ...(column.label == activeId
          ? {
              filterFn: (row) => row.original.isVisibleFunction(),
              cell: ({ row }) => {
                return row.original.isActive ? <Icon name="isActive" /> : "";
              }
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

    if (inset != null) {
      columnDef = [
        {
          id: expanderId,
          enableHiding: false,
          size: isCompactMode ? 40 : 60,
          header: ({ table }: { table: Table<any> }) => (
            <IconButton onClick={() => table.toggleAllRowsExpanded(!table.getIsSomeRowsExpanded())} size="small" style={{ padding: 0 }}>
              <Icon name={table.getIsSomeRowsExpanded() ? "chevronUp" : "chevronDown"} />
            </IconButton>
          ),
          cell: ({ row }) => {
            return row.getCanExpand() ? (
              <div style={{ display: "flex" }}>
                <IconButton onClick={row.getToggleExpandedHandler()} size="small" style={{ margin: "auto", padding: 0 }}>
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
          size: isCompactMode ? 36 : 60,
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
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: inset != null ? (row) => !!row.original.inset?.length : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableExpanding: inset != null,
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

  return (
    <div style={{ display: showTotalItems ? "grid" : "", gridTemplateRows: showTotalItems ? "50px 1fr" : "", overflowY: "auto", height: "100%" }}>
      <Panel
        showTotalItems={showTotalItems}
        checkableRows={checkableRows}
        panelElements={panelElements}
        numberOfCheckedItems={Object.keys(rowSelection).length}
        numberOfItems={data?.length}
        table={table}
        viewId={viewId}
        columns={columns}
        expandableRows={inset != null}
      />
      <div ref={tableContainerRef} style={{ overflowY: "auto", height: "100%" }}>
        <StyledTable>
          <TableHead
            style={{
              position: "sticky",
              top: 0,
              zIndex: inset != null ? 2 : 1
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <StyledTr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <StyledTh key={header.id} style={{ width: header.getSize() }} sticky={stickyLeftColumns}>
                    <div
                      style={{ cursor: "pointer" }}
                      {...{
                        onClick: header.column.getCanSort()
                          ? (event) => {
                              header.column.getToggleSortingHandler()(event);
                              //collapse all rows to avoid wrong height calculations when sorting expanded rows
                              table.toggleAllRowsExpanded(false);
                              rowVirtualizer.measure();
                            }
                          : undefined
                      }}
                    >
                      {{
                        asc: <Icon size={16} name="arrowUp" style={{ position: "relative", top: 3 }} />,
                        desc: <Icon size={16} name="arrowDown" style={{ position: "relative", top: 3 }} />
                      }[header.column.getIsSorted() as string] ?? null}
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.id != selectId && header.id != expanderId && (
                      <div
                        {...{
                          onMouseDown: (event) => {
                            header.getResizeHandler()(event);
                            event.stopPropagation();
                          },
                          onTouchStart: (event) => {
                            header.getResizeHandler()(event);
                            event.stopPropagation();
                          },
                          className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`
                        }}
                      />
                    )}
                  </StyledTh>
                ))}
              </StyledTr>
            ))}
          </TableHead>
          <TableBody style={{ height: rowVirtualizer.getTotalSize() + "px", position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<any>;
              return (
                <Fragment key={row.id}>
                  <StyledTr
                    selected={row.getIsSelected()}
                    onContextMenu={
                      onContextMenu
                        ? (event) =>
                            onContextMenu(
                              event,
                              row.original,
                              table.getSelectedRowModel().flatRows.map((r) => r.original)
                            )
                        : (e) => e.preventDefault()
                    }
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: `${
                        row.getIsExpanded() && row.original.inset?.length != 0 ? headCellHeight + cellHeight + cellHeight * row.original.inset?.length ?? 0 : cellHeight
                      }px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <StyledTd
                        key={cell.id}
                        style={{ width: cell.column.getSize(), left: cell.column.getStart() }}
                        onClick={(event) => selectRow(event, row, table)}
                        clickable={onSelect && cell.column.id != selectId}
                        sticky={stickyLeftColumns}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </StyledTd>
                    ))}
                  </StyledTr>
                  {row.getIsExpanded() && row.original.inset?.length != 0 && (
                    <tr
                      style={{
                        position: "absolute",
                        background: "white",
                        width: "100%",
                        top: `${virtualRow.start + cellHeight}px`,
                        left: 0,
                        border: 0
                      }}
                    >
                      <td
                        colSpan={row.getVisibleCells().length}
                        style={{
                          height: `${cellHeight * row.original.inset.length + headCellHeight}px`,
                          padding: 0
                        }}
                      >
                        <TanstackTable columns={inset.columns} data={row.original.inset} showTotalItems={false} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </StyledTable>
      </div>
    </div>
  );
};

const StyledTable = styled.table`
  width: 100%;
  border-spacing: 0;

  .resizer {
    right: 0;
    top: 0;
    position: absolute;
    height: 100%;
    width: 7px;
    background: rgba(0, 0, 0, 0.5);
    cursor: col-resize;
    user-select: none;
    touch-action: none;
  }

  .resizer.isResizing {
    background: ${colors.infographic.primaryMossGreen};
    opacity: 1;
  }

  @media (hover: hover) {
    .resizer {
      opacity: 0;
    }

    *:hover > .resizer {
      opacity: 1;
    }
  }
`;

const StyledTr = styled.tr<{ selected?: boolean }>`
  &&& {
    background-color: ${(props) => (props.selected ? colors.interactive.textHighlight : "white")};
  }
  &:nth-of-type(even) {
    background-color: ${colors.interactive.tableHeaderFillResting};
  }
  &&&:hover {
    background-color: ${colors.interactive.tableCellFillActivated};
  }
  display: flex;
  width: fit-content;
`;

const StyledTh = styled(TableCell)<{ sticky: boolean }>`
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

const StyledTd = styled(TableCell)<{ clickable: boolean; sticky: boolean }>`
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
