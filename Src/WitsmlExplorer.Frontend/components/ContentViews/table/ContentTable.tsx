import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Moment from "react-moment";
import orderBy from "lodash/orderBy";
import { Checkbox, Table, TableBody, TableCell as MuiTableCell, TableHead, TableRow as MuiTableRow, TableSortLabel } from "@material-ui/core";
import { DateFormat } from "../../Constants";
import { ContentTableProps, ContentTableRow, ContentType, Order, getSelectedRange, getCheckedRows, ContentTableColumn, getComparatorByColumn } from "./";
import { colors } from "../../../styles/Colors";
import { IsActiveIcon } from "../../Icons/IsActiveIcon";

export const ContentTable = (props: ContentTableProps): React.ReactElement => {
  const { columns, onSelect, onContextMenu, checkableRows } = props;
  const [data, setData] = useState<any[]>(props.data ?? []);
  const [checkedContentItems, setCheckedContentItems] = useState<ContentTableRow[]>([]);
  const [sortOrder, setSortOrder] = useState<Order>(Order.Ascending);
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
            columns.map((column) => (
              <TableHeaderCell key={column.property} align={column.type === ContentType.Number ? "right" : "left"}>
                <TableSortLabel active={sortedColumn === column} direction={sortOrder} onClick={() => sortByColumn(column)}>
                  {column.label}
                </TableSortLabel>
              </TableHeaderCell>
            ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => {
          return (
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
                        align={column.type === ContentType.Number ? "right" : "left"}
                        onClick={(event) => selectRow(event, item)}
                      >
                        {format(column.type, item[column.property])}
                      </TableDataCell>
                    )
                )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const format = (type: ContentType, data: string | Date | boolean) => {
  switch (type) {
    case ContentType.DateTime:
      return formatDate(data as Date, DateFormat.DATETIME_S);
    case ContentType.Date:
      return formatDate(data as Date, DateFormat.DATE);
    case ContentType.Icon:
      return data && <IsActiveIcon />;
    default:
      return data;
  }
};

const formatDate = (date: Date, format: string) => {
  if (date) {
    return <Moment format={format} date={date} />;
  } else {
    return "";
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
`;

const TableDataCell = styled(MuiTableCell)<{ type?: ContentType; clickable?: string }>`
  position: relative;
  z-index: 0;
  :first-child {
    color: ${colors.text.staticIconsDefault};
  }
  &:not(:first-child) {
    color: ${colors.text.staticIconsTertiary};
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
    type === ContentType.Number &&
    `
    font-feature-settings: "tnum";
  `};
`;

export default ContentTable;
