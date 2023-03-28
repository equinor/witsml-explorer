import { Checkbox, Table, TableBody, TableCell as MuiTableCell, TableHead, TableRow as MuiTableRow, TableSortLabel } from "@material-ui/core";
import orderBy from "lodash/orderBy";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { colors } from "../../../styles/Colors";
import Icon from "../../../styles/Icons";
import { ContentTableColumn, ContentTableProps, ContentTableRow, ContentType, getCheckedRows, getColumnAlignment, getComparatorByColumn, getSelectedRange, Order } from "./";

export const ContentTable = (props: ContentTableProps): React.ReactElement => {
  const { columns, onSelect, onContextMenu, checkableRows, order } = props;
  const [data, setData] = useState<any[]>(props.data ?? []);
  const [checkedContentItems, setCheckedContentItems] = useState<ContentTableRow[]>([]);
  const [sortOrder, setSortOrder] = useState<Order>(order ?? Order.Ascending);
  const [sortedColumn, setSortedColumn] = useState<ContentTableColumn>(columns[0]);
  const [activeIndexRange, setActiveIndexRange] = useState<number[]>([]);

  useEffect(() => {
    setData(orderBy(props.data, getComparatorByColumn(sortedColumn), [sortOrder, sortOrder]));
  }, [props.data, sortOrder, sortedColumn]);

  const sortByColumn = (columnToSort: ContentTableColumn) => {
    const flipOrder = (order: Order) => (order === Order.Ascending ? Order.Descending : Order.Ascending);
    const isSameColumn = columnToSort === sortedColumn;
    const order = isSameColumn ? flipOrder(sortOrder) : Order.Ascending;
    setSortOrder(order);
    setSortedColumn(columnToSort);
  };

  const selectRow = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: ContentTableRow) => {
    if (onSelect) {
      onSelect(currentRow);
    } else {
      toggleRow(e, currentRow);
    }
  };

  const toggleRow = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, currentRow: ContentTableRow) => {
    const isShiftKeyDown = e.shiftKey;
    const selectedRange = getSelectedRange(isShiftKeyDown, currentRow, data, activeIndexRange);
    const checkedRows = getCheckedRows(currentRow, data, selectedRange, checkedContentItems);
    setActiveIndexRange(selectedRange);
    setCheckedContentItems(checkedRows);
  };

  const toggleAllRows = () => {
    if (data.length == checkedContentItems.length) {
      setCheckedContentItems([]);
    } else {
      setCheckedContentItems([...data]);
    }
  };

  const checkVisibility = (isVisibleFunction: () => boolean): boolean => {
    if (typeof isVisibleFunction === "undefined") return true;
    return isVisibleFunction();
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          {checkableRows && (
            <TableHeaderCell>
              <Checkbox
                onChange={toggleAllRows}
                checked={checkedContentItems.length === data.length}
                indeterminate={checkedContentItems.length > 0 && checkedContentItems.length < data.length}
              />
            </TableHeaderCell>
          )}
          {columns &&
            columns.map(
              (column) =>
                column && (
                  <TableHeaderCell key={column.property} align={getColumnAlignment(column)}>
                    <TableSortLabel active={sortedColumn === column} direction={sortOrder} onClick={() => sortByColumn(column)}>
                      {column.label}
                    </TableSortLabel>
                  </TableHeaderCell>
                )
            )}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => {
          return (
            checkVisibility(item.isVisibleFunction) && (
              <TableRow hover key={index} onContextMenu={onContextMenu ? (event) => onContextMenu(event, item, checkedContentItems) : (e) => e.preventDefault()}>
                {checkableRows && (
                  <TableDataCell>
                    <Checkbox
                      onClick={(event) => toggleRow(event, item)}
                      checked={checkedContentItems?.length > 0 && checkedContentItems.findIndex((checkedRow: ContentTableRow) => item.id === checkedRow.id) !== -1}
                    />
                  </TableDataCell>
                )}
                {columns &&
                  columns.map(
                    (column) =>
                      column && (
                        <TableDataCell
                          id={item[column.property] + column.property}
                          key={item[column.property] + column.property}
                          clickable={onSelect ? "true" : "false"}
                          type={column.type}
                          align={getColumnAlignment(column)}
                          onClick={(event) => selectRow(event, item)}
                        >
                          {formatCell(column.type, item[column.property])}
                        </TableDataCell>
                      )
                  )}
              </TableRow>
            )
          );
        })}
      </TableBody>
    </Table>
  );
};

export const formatCell = (type: ContentType, data: string | boolean) => {
  switch (type) {
    case ContentType.Icon:
      return data && <Icon name="isActive" />;
    default:
      return data;
  }
};

const TableRow = styled(MuiTableRow)`
  &&&:hover {
    background-color: ${colors.interactive.tableHeaderFillResting};
  }
`;

const TableHeaderCell = styled(MuiTableCell)`
  && {
    border-bottom-width: 2px;
    position: sticky;
    top: 0;
    background-color: ${colors.interactive.tableHeaderFillResting};
    z-index: 1;
    color: ${colors.text.staticIconsDefault};
  }
`;

const TableDataCell = styled(MuiTableCell)<{ type?: ContentType; clickable?: string }>`
  position: relative;
  z-index: 0;
  border-right: 1px solid rgba(224, 224, 224, 1);
  && {
    color: ${colors.text.staticIconsDefault};
    font-family: EquinorMedium;
  }
  cursor: ${(props) => (props.clickable === "true" ? "pointer" : "arrow")};
  ${({ type }) =>
    type === ContentType.String &&
    `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `};
  ${({ type }) =>
    (type === ContentType.Number || type === ContentType.Measure) &&
    `
    font-feature-settings: "tnum";
  `};
  ${({ type }) =>
    type === ContentType.DateTime &&
    `
    font-feature-settings: "tnum";
    white-space: nowrap;
  `};
`;

export default ContentTable;
