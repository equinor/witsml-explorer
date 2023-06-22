import { Checkbox, TableCell as MuiTableCell, TableSortLabel, Tooltip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import orderBy from "lodash/orderBy";
import memoizeOne from "memoize-one";
import React, { forwardRef, memo, useCallback, useContext, useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import styled from "styled-components";
import { IndexRange } from "../../../models/jobs/deleteLogCurveValuesJob";
import LogObject from "../../../models/logObject";
import { colors } from "../../../styles/Colors";
import { formatCell } from "./ContentTable";
import Panel from "./Panel";
import {
  ContentTableColumn,
  ContentTableProps,
  ContentTableRow,
  ContentType,
  Order,
  getCheckedRows,
  getColumnAlignment,
  getComparatorByColumn,
  getSelectedRange
} from "./tableParts";

interface RowProps {
  index: number;
  style: any;
  data: RowData;
}
interface RowData {
  columns: ContentTableColumn[];
  width: number;
  items: any[];
  onSelect?: (row: ContentTableRow) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLElement, MouseEvent>, selectedItem: Record<string, any>, checkedItems: Record<string, any>[]) => void;
  onToggleRow?: (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: ContentTableRow) => void;
}
interface VirtualizedTableContext {
  columns: ContentTableColumn[];
  checkableRows: boolean;
  isCompactMode: boolean;
  storeCheckboxColumnReference: (ref: any) => void;
  toggleAllRows: () => void;
  checkedContentItems: ContentTableRow[];
  data: any[];
  storeColumnReference: (ref: any, index: number) => void;
  sortedColumn: ContentTableColumn;
  sortByColumn: (columnToSort: ContentTableColumn) => void;
  sortOrder: Order;
}
const TableContext = React.createContext({} as VirtualizedTableContext);
const columnRefs: string[] = [];

const Row = memo(({ data, index, style }: RowProps) => {
  const { columns, width, items, onContextMenu, onSelect, onToggleRow } = data;
  const { checkableRows, isCompactMode, checkedContentItems } = useContext(TableContext);
  const item = items[index];
  return (
    <RowWrapper key={"Row-" + index} style={style} columns={columns} checkableRows={checkableRows} width={width} compactMode={isCompactMode}>
      <TableRow
        key={"TableRow-" + index}
        hover
        onClick={(event) => onToggleRow(event, item)}
        className={
          (index % 2 !== 0 ? "evenrow " : "") +
          (checkableRows && checkedContentItems.length > 0 && checkedContentItems.findIndex((checkedRow: ContentTableRow) => item.id === checkedRow.id) !== -1 ? "selectedrow" : "")
        }
        onContextMenu={onContextMenu ? (event) => onContextMenu(event, item, checkedContentItems) : (e) => e.preventDefault()}
      >
        {checkableRows && (
          <TableDataCell key={`${index}-checkbox`} component={"div"}>
            <Checkbox
              onClick={(event) => onToggleRow(event, item)}
              checked={checkedContentItems.length > 0 && checkedContentItems.findIndex((checkedRow: ContentTableRow) => item.id === checkedRow.id) !== -1}
            />
          </TableDataCell>
        )}
        {columns &&
          columns.map((column: { property: string; type: ContentType }) => (
            <Tooltip
              title={item[column.property] == null ? "" : item[column.property]}
              key={column.property + "-" + index + "-tooltip"}
              placement="top"
              arrow
              interactive
              enterDelay={500}
              disableHoverListener={item[column.property] === "" || item[column.property] == null}
            >
              <TableDataCell
                id={item[column.property] + column.property}
                key={column.property + "-" + index}
                component={"div"}
                clickable={onSelect ? "true" : "false"}
                align={getColumnAlignment(column)}
              >
                {formatCell(column.type, item[column.property])}
              </TableDataCell>
            </Tooltip>
          ))}
      </TableRow>
    </RowWrapper>
  );
});
Row.displayName = "VirtualizedRow";

const innerGridElementType = forwardRef<HTMLDivElement, any>(({ children, ...rest }: any, ref) => {
  const {
    columns,
    checkableRows,
    isCompactMode,
    storeCheckboxColumnReference,
    toggleAllRows,
    checkedContentItems,
    data,
    sortedColumn,
    sortOrder,
    sortByColumn,
    storeColumnReference
  } = useContext(TableContext);

  return (
    <div ref={ref} style={rest.style}>
      <TableHeader>
        <RowWrapper columns={columns} checkableRows={checkableRows} isHeader compactMode={isCompactMode}>
          {checkableRows && (
            <TableHeaderCell component={"div"} ref={storeCheckboxColumnReference}>
              <Checkbox
                onChange={toggleAllRows}
                checked={checkedContentItems.length === data.length}
                indeterminate={checkedContentItems.length > 0 && checkedContentItems.length < data.length}
              />
            </TableHeaderCell>
          )}
          {columns &&
            columns.map((column: ContentTableColumn, index: number) => (
              <TableHeaderCell component={"div"} key={column.property} align={getColumnAlignment(column)} ref={(ref: any) => storeColumnReference(ref, index)}>
                <TableSortLabel active={sortedColumn === column} direction={sortOrder} onClick={() => sortByColumn(column)}>
                  {column.label}
                </TableSortLabel>
              </TableHeaderCell>
            ))}
        </RowWrapper>
      </TableHeader>
      <DataContainer>{children}</DataContainer>
    </div>
  );
});
innerGridElementType.displayName = "innerGridElementType";

export const VirtualizedContentTable = (props: ContentTableProps): React.ReactElement => {
  const { columns, onSelect, onContextMenu, checkableRows, onRowSelectionChange, panelElements } = props;
  const [data, setData] = useState<any[]>(props.data ?? []);
  const [checkedContentItems, setCheckedContentItems] = useState<ContentTableRow[]>([]);
  const [sortOrder, setSortOrder] = useState<Order>(Order.Ascending);
  const [sortedColumn, setSortedColumn] = useState<ContentTableColumn>(columns[0]);
  const [activeIndexRange, setActiveIndexRange] = useState<number[]>([]);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";

  useEffect(() => {
    setData(() => orderBy(props.data, getComparatorByColumn(sortedColumn), [sortOrder, sortOrder]));
  }, [props.data, sortOrder, sortedColumn]);

  useEffect(() => {
    onRowSelectionChange([...checkedContentItems], sortOrder, sortedColumn);
  }, [checkedContentItems, sortOrder, sortedColumn]);

  const sortByColumn = useCallback(
    (columnToSort: ContentTableColumn) => {
      const isSameColumn = columnToSort === sortedColumn;
      const order = isSameColumn ? flipOrder(sortOrder) : Order.Ascending;
      setSortOrder(order);
      setSortedColumn(columnToSort);
    },
    [sortedColumn, sortOrder]
  );

  const toggleRow = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: ContentTableRow) => {
      const isShiftKeyDown = e.shiftKey;
      const selectedRange = getSelectedRange(isShiftKeyDown, currentRow, data, activeIndexRange);
      const checkedRows = getCheckedRows(currentRow, data, selectedRange, checkedContentItems);
      setActiveIndexRange(selectedRange);
      setCheckedContentItems(checkedRows);
    },
    [data, activeIndexRange, checkedContentItems]
  );

  const toggleAllRows = useCallback(() => {
    if (data.length == checkedContentItems.length) {
      setCheckedContentItems([]);
    } else {
      setCheckedContentItems([...data]);
    }
    setActiveIndexRange([]);
  }, [data.length, checkedContentItems.length]);

  const getItemData = memoizeOne(
    (columns, width, items, onContextMenu, onSelect, onToggleRow): RowData => ({
      columns: columns,
      width: width,
      items: items,
      onContextMenu: onContextMenu,
      onSelect: onSelect,
      onToggleRow: onToggleRow
    })
  );

  const ROW_SIZE = isCompactMode ? 32 : 48;
  const itemKey = useCallback((index: number, data: any) => data.items[index][columns[0].property], [columns[0]]);

  const storeCheckboxColumnReference = useCallback(
    (ref: any) => {
      if (columnRefs.length > 0) {
        columnRefs[0] = ref;
      } else {
        columnRefs.push(ref);
      }
    },
    [columnRefs.length]
  );

  const storeColumnReference = useCallback(
    (ref: any, index: number) => {
      const offset = checkableRows ? 1 : 0;
      if (columnRefs.length > offset) {
        columnRefs[index + offset] = ref;
      } else {
        columnRefs.push(ref);
      }
    },
    [checkableRows, columnRefs.length]
  );

  return (
    <>
      {columns && (
        <>
          {data && (
            <TableContext.Provider
              value={{
                checkableRows: checkableRows,
                isCompactMode: isCompactMode,
                columns: columns,
                checkedContentItems: checkedContentItems,
                data: data,
                sortByColumn: sortByColumn,
                sortOrder: sortOrder,
                sortedColumn: sortedColumn,
                storeCheckboxColumnReference: storeCheckboxColumnReference,
                storeColumnReference: storeColumnReference,
                toggleAllRows: toggleAllRows
              }}
            >
              <Panel showCheckedItems={checkableRows} panelElements={panelElements} numberOfCheckedItems={checkedContentItems?.length} numberOfItems={data?.length} />
              <AutoSizer>
                {({ height, width }) => {
                  const itemData = getItemData(columns, width, data, onContextMenu, onSelect, toggleRow);

                  return (
                    <List height={height} width={width} itemCount={data.length} itemSize={ROW_SIZE} itemKey={itemKey} itemData={itemData} innerElementType={innerGridElementType}>
                      {Row}
                    </List>
                  );
                }}
              </AutoSizer>
            </TableContext.Provider>
          )}
        </>
      )}
    </>
  );
};

export const getIndexRanges = (checkedContentItems: ContentTableRow[], selectedLog: LogObject): IndexRange[] => {
  const sortedItems = checkedContentItems.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const indexCurve = selectedLog.indexCurve;

  return sortedItems.reduce((accumulator: IndexRange[], currentElement: any, currentIndex) => {
    const currentId = currentElement["id"];
    const indexValue = String(currentElement[indexCurve]);

    if (accumulator.length === 0) {
      accumulator.push({ startIndex: indexValue, endIndex: indexValue });
    } else {
      const inSameRange = currentId - sortedItems[currentIndex - 1].id === 1;
      if (inSameRange) {
        accumulator[accumulator.length - 1].endIndex = indexValue;
      } else {
        accumulator.push({ startIndex: indexValue, endIndex: indexValue });
      }
    }
    return accumulator;
  }, []);
};

const flipOrder = (order: Order) => (order === Order.Ascending ? Order.Descending : Order.Ascending);

const configureTemplateColumns = memoizeOne((checkableRows: boolean, isHeader: boolean, columns: ContentTableColumn[]) => {
  let templateColumns = [];

  if (isHeader) {
    if (checkableRows) {
      templateColumns.push("50px");
    }
    const columnWidth = "200px";
    const columnWidths = new Array(columns.length).fill(columnWidth);
    columnWidths[0] = "235px"; //make the first data column wider to fit datetime index
    templateColumns = templateColumns.concat(columnWidths);
  } else {
    templateColumns = columnRefs.map((ref: any) => {
      if (!ref) return "1fr";
      return `${ref.offsetWidth}px`;
    });
  }

  return templateColumns.join(" ");
});

interface RowWrapperProps {
  columns: ContentTableColumn[];
  checkableRows: boolean;
  isHeader?: boolean;
  width?: number;
  compactMode: boolean;
}

const DataContainer = styled.div`
  position: absolute;
`;

const RowWrapper = styled.div<RowWrapperProps>`
  display: grid;
  grid-template-columns: ${(props) => configureTemplateColumns(props.checkableRows, props.isHeader, props.columns)};
  grid-auto-rows: minmax(${(props) => (props.compactMode ? "2rem" : "3rem")}, auto);
  font-size: 0.875rem;
  width: max-content !important;
`;

const TableHeader = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  line-height: 1.5rem;
  z-index: 3;
`;

const TableHeaderCell = styled(MuiTableCell)`
  color: ${colors.text.staticIconsDefault};
  background-color: ${colors.interactive.tableHeaderFillResting};
  && {
    border-bottom-width: 2px;
  }

  & .MuiTableSortLabel-root {
    color: ${colors.text.staticIconsDefault};
  }

  & .MuiTableSortLabel-root.MuiTableSortLabel-active {
    color: ${colors.text.staticIconsDefault};
  }
  &:nth-child(1) {
    position: sticky;
    z-index: 3;
    left: 0;
  }
  &:nth-child(2) {
    position: sticky;
    z-index: 3;
    left: 50px;
  }
`;

const TableRow = styled.div<{ hover: boolean }>`
  display: contents;
`;

const TableDataCell = styled(MuiTableCell)<{ clickable?: string }>`
  background-color: white;
  border-right: 1px solid rgba(224, 224, 224, 1);
  && {
    color: ${colors.text.staticIconsDefault};
    font-family: EquinorMedium;
  }
  cursor: ${(props) => (props.clickable === "true" ? "pointer" : "arrow")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-feature-settings: "tnum";
  ${TableRow}.evenrow & {
    background-color: ${colors.interactive.tableHeaderFillResting};
  }
  ${TableRow}.selectedrow & {
    background-color: ${colors.interactive.textHighlight};
  }
  ${TableRow}:hover & {
    background-color: ${colors.interactive.tableCellFillActivated};
  }
  &:nth-child(1) {
    position: sticky;
    z-index: 2;
    left: 0;
  }
  &:nth-child(2) {
    position: sticky;
    z-index: 2;
    left: 50px;
  }
`;
TableDataCell.displayName = "TableDataCell";

export default VirtualizedContentTable;
