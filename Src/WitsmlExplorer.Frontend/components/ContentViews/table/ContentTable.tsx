import { TableBody, TableHead, useTheme } from "@material-ui/core";
import {
  ColumnSizingState,
  Header,
  Row,
  RowData,
  RowSelectionState,
  SortDirection,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { Fragment, useContext, useEffect, useState } from "react";
import OperationContext from "../../../contexts/operationContext";
import { indexToNumber } from "../../../models/logObject";
import { Colors } from "../../../styles/Colors";
import Icon from "../../../styles/Icons";
import { useColumnDef } from "./ColumnDef";
import Panel from "./Panel";
import { initializeColumnVisibility, useStoreVisibilityEffect, useStoreWidthsEffect } from "./contentTableStorage";
import { StyledResizer, StyledTable, StyledTd, StyledTh, StyledTr, TableContainer } from "./contentTableStyles";
import {
  calculateHorizontalSpace,
  calculateRowHeight,
  componentSortingFn,
  constantTableOptions,
  expanderId,
  isClickable,
  measureSortingFn,
  selectId,
  toggleRow,
  useInitActiveCurveFiltering
} from "./contentTableUtils";
import { ContentTableColumn, ContentTableProps } from "./tableParts";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    previousIndex: number;
    setPreviousIndex: (index: number) => void;
    colors: Colors;
  }
}

export const ContentTable = (contentTableProps: ContentTableProps): React.ReactElement => {
  const {
    columns,
    data,
    onSelect,
    onContextMenu,
    checkableRows,
    insetColumns,
    panelElements,
    showPanel = true,
    showRefresh = false,
    stickyLeftColumns = 0,
    viewId,
    downloadToCsvFileName = null,
    onRowSelectionChange,
    initiallySelectedRows = []
  } = contentTableProps;
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const [previousIndex, setPreviousIndex] = useState<number>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(Object.assign({}, ...initiallySelectedRows.map((row) => ({ [row.id]: true }))));
  const [columnVisibility, setColumnVisibility] = useState(initializeColumnVisibility(viewId));
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const isCompactMode = useTheme().props.MuiCheckbox?.size === "small";
  const cellHeight = isCompactMode ? 30 : 53;
  const headCellHeight = isCompactMode ? 35 : 55;

  const columnDef = useColumnDef(viewId, columns, insetColumns, checkableRows, stickyLeftColumns);
  const table = useReactTable({
    data: data ?? [],
    columns: columnDef,
    state: {
      rowSelection,
      columnVisibility,
      columnSizing
    },
    sortingFns: {
      [measureSortingFn]: (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
        const a = indexToNumber(rowA.getValue(columnId));
        const b = indexToNumber(rowB.getValue(columnId));
        return a > b ? -1 : a < b ? 1 : 0;
      },
      [componentSortingFn]: (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
        const a = rowA.getValue(columnId) == null;
        const b = rowB.getValue(columnId) == null;
        return a === b ? 0 : a ? -1 : 1;
      }
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: insetColumns != null ? (row) => !!row.original.inset?.length : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: (updaterOrValue) => {
      const newRowSelection = updaterOrValue instanceof Function ? updaterOrValue(rowSelection) : updaterOrValue;
      setRowSelection(newRowSelection);
      onRowSelectionChange?.(data.filter((_, index) => newRowSelection[index]));
    },
    meta: {
      previousIndex,
      setPreviousIndex,
      colors
    },
    enableExpanding: insetColumns != null,
    enableRowSelection: checkableRows,
    ...constantTableOptions
  });

  useStoreWidthsEffect(viewId, table);
  useStoreVisibilityEffect(viewId, columnVisibility);
  useInitActiveCurveFiltering(table);

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: table.getRowModel().rows.length,
    overscan: 5,
    estimateSize: () => cellHeight
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: table.getVisibleLeafColumns().length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: (index: number) => table.getLeafHeaders()[index].getSize(),
    overscan: 5,
    rangeExtractor: (range) => {
      return [...Array.from(Array(stickyLeftColumns).keys()), ...defaultRangeExtractor(range).filter((value) => value >= stickyLeftColumns)];
    }
  });

  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnSizing]);

  const columnItems = columnVirtualizer.getVirtualItems();
  const [spaceLeft, spaceRight] = calculateHorizontalSpace(columnItems, columnVirtualizer.getTotalSize(), stickyLeftColumns);

  const onHeaderClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, header: Header<any, unknown>) => {
    if (header.column.getCanSort()) {
      header.column.getToggleSortingHandler()(e);
      //collapse all rows to avoid wrong height calculations when sorting expanded rows
      table.toggleAllRowsExpanded(false);
      rowVirtualizer.measure();
    }
  };

  const onRowContextMenu = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: Row<any>) => {
    if (onContextMenu) {
      onContextMenu(
        e,
        row.original,
        table.getSelectedRowModel().flatRows.map((r) => r.original)
      );
    }
  };

  const onSelectRow = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: Row<any>, table: Table<any>) => {
    if (onSelect) {
      onSelect(currentRow.original);
    } else if (checkableRows) {
      toggleRow(e, currentRow, table);
    }
  };

  return (
    <TableContainer showPanel={showPanel}>
      {showPanel ? (
        <Panel
          checkableRows={checkableRows}
          panelElements={panelElements}
          numberOfCheckedItems={Object.keys(rowSelection).length}
          numberOfItems={data?.length}
          table={table}
          viewId={viewId}
          columns={columns}
          expandableRows={insetColumns != null}
          showRefresh={showRefresh}
          downloadToCsvFileName={downloadToCsvFileName}
          stickyLeftColumns={stickyLeftColumns}
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
            <tr style={{ display: "flex" }}>
              <th style={{ width: `${spaceLeft}px` }} />
              {columnItems.map((column) => {
                const header = table.getLeafHeaders()[column.index];
                return (
                  <StyledTh
                    key={header.id}
                    style={{ width: header.getSize(), left: column.index < stickyLeftColumns ? column.start : 0 }}
                    sticky={column.index < stickyLeftColumns ? 1 : 0}
                    colors={colors}
                  >
                    <div role="button" style={{ cursor: "pointer" }} onClick={(e) => onHeaderClick(e, header)}>
                      {header.column.getIsSorted() && sortingIcons[header.column.getIsSorted() as SortDirection]}
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.id != selectId && header.id != expanderId && <Resizer header={header} />}
                  </StyledTh>
                );
              })}
              <th style={{ width: `${spaceRight}px` }} />
            </tr>
          </TableHead>
          <TableBody style={{ height: rowVirtualizer.getTotalSize() + "px", position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<any>;
              return (
                <Fragment key={row.id}>
                  <StyledTr
                    selected={row.getIsSelected()}
                    onContextMenu={async (e) => {
                      // await selection to ensure that the context menu detects that a row has been selected
                      await row.toggleSelected(true);
                      onRowContextMenu(e, row);
                    }}
                    style={{
                      height: `${calculateRowHeight(row, headCellHeight, cellHeight)}px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    colors={colors}
                  >
                    <td style={{ width: `${spaceLeft}px` }} />
                    {columnItems.map((column) => {
                      const cell = row.getVisibleCells()[column.index];
                      const clickable = isClickable(onSelect, cell.column.id, checkableRows);
                      return (
                        <StyledTd
                          key={cell.id}
                          style={{ width: cell.column.getSize(), height: cellHeight, left: column.index < stickyLeftColumns ? column.start : 0 }}
                          onClick={clickable ? (event) => onSelectRow(event, row, table) : undefined}
                          clickable={clickable ? 1 : 0}
                          sticky={column.index < stickyLeftColumns ? 1 : 0}
                          colors={colors}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </StyledTd>
                      );
                    })}
                    <td style={{ width: `${spaceRight}px` }} />
                  </StyledTr>
                  {row.getIsExpanded() && row.original.inset?.length != 0 && (
                    <Inset
                      parentStart={virtualRow.start}
                      cellHeight={cellHeight}
                      headCellHeight={headCellHeight}
                      data={row.original.inset}
                      columns={insetColumns}
                      colors={colors}
                    />
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
  colors: Colors;
}

const Inset = (props: InsetProps): React.ReactElement => {
  const { parentStart, cellHeight, headCellHeight, data, columns, colors } = props;
  return (
    <tr
      style={{
        position: "absolute",
        background: colors.ui.backgroundDefault,
        width: "100%",
        top: `${parentStart + cellHeight}px`,
        left: 0,
        border: 0,
        paddingLeft: 75
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
