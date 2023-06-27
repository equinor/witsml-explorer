import { Checkbox, TableCell as MuiTableCell, TableRow as MuiTableRow, Table, TableBody, TableHead, TableSortLabel } from "@material-ui/core";
import orderBy from "lodash/orderBy";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../../contexts/operationContext";
import { Colors, light } from "../../../styles/Colors";
import Icon from "../../../styles/Icons";
import { ContentTableColumn, ContentTableProps, ContentTableRow, ContentType, Order, getCheckedRows, getColumnAlignment, getComparatorByColumn, getSelectedRange } from "./";
import { InsetHeader, InsetRow, InsetToggle } from "./Inset";
import Panel from "./Panel";

export const ContentTable = (props: ContentTableProps): React.ReactElement => {
  const { columns, onSelect, onContextMenu, checkableRows, order, inset, panelElements, showPanel = true, showRefresh = false } = props;
  const [data, setData] = useState<any[]>(props.data ?? []);
  const [checkedContentItems, setCheckedContentItems] = useState<ContentTableRow[]>([]);
  const [sortOrder, setSortOrder] = useState<Order>(order ?? Order.Ascending);
  const [sortedColumn, setSortedColumn] = useState<ContentTableColumn>(columns[0]);
  const [activeIndexRange, setActiveIndexRange] = useState<number[]>([]);
  const [openInsets, setOpenInsets] = useState<string[]>([]);
  const { operationState } = useContext(OperationContext);
  const colors: Colors = operationState?.colors || light;

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
    <>
      {showPanel ? (
        <Panel
          showCheckedItems={checkableRows}
          panelElements={panelElements}
          numberOfCheckedItems={checkedContentItems?.length}
          numberOfItems={data?.length}
          showRefresh={showRefresh}
        />
      ) : null}
      <Table>
        <TableHead>
          <TableRow colors={colors}>
            {checkableRows && (
              <TableHeaderCell colors={colors}>
                <Checkbox
                  onChange={toggleAllRows}
                  checked={checkedContentItems.length === data.length}
                  indeterminate={checkedContentItems.length > 0 && checkedContentItems.length < data.length}
                />
              </TableHeaderCell>
            )}
            <InsetHeader inset={inset} openInsets={openInsets} data={data} setOpenInsets={setOpenInsets} />
            {columns &&
              columns.map(
                (column) =>
                  column && (
                    <TableHeaderCell colors={colors} key={column.property} align={getColumnAlignment(column)}>
                      <TableSortLabel
                        style={{ color: colors.text.staticIconsTertiary }}
                        active={sortedColumn === column}
                        direction={sortOrder}
                        onClick={() => sortByColumn(column)}
                      >
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
                <React.Fragment key={index}>
                  <TableRow
                    hover
                    selected={checkableRows && checkedContentItems?.length > 0 && checkedContentItems.findIndex((checkedRow: ContentTableRow) => item.id === checkedRow.id) !== -1}
                    colors={colors}
                    onContextMenu={onContextMenu ? (event) => onContextMenu(event, item, checkedContentItems) : (e) => e.preventDefault()}
                  >
                    {checkableRows && (
                      <TableDataCell colors={colors}>
                        <Checkbox
                          onClick={(event) => toggleRow(event, item)}
                          checked={checkedContentItems?.length > 0 && checkedContentItems.findIndex((checkedRow: ContentTableRow) => item.id === checkedRow.id) !== -1}
                        />
                      </TableDataCell>
                    )}
                    <InsetToggle inset={inset} openInsets={openInsets} uid={item.uid} setOpenInsets={setOpenInsets} />
                    {columns &&
                      columns.map(
                        (column) =>
                          column && (
                            <TableDataCell
                              colors={colors}
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
                  <InsetRow inset={inset} openInsets={openInsets} columnsLength={columns.length} uid={item.uid} />
                </React.Fragment>
              )
            );
          })}
        </TableBody>
      </Table>
    </>
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

const TableRow = styled(MuiTableRow)<{ colors?: Colors }>`
  &&& {
    background-color: ${(props) => (props.selected ? props.colors.interactive.textHighlight : "")};
  }
  &:nth-of-type(even) {
    background-color: ${(props) => props.colors.interactive.tableHeaderFillResting};
  }
  &&&:hover {
    background-color: ${(props) => props.colors.interactive.tableCellFillActivated};
  }
`;

export const TableHeaderCell = styled(MuiTableCell)<{ colors?: Colors }>`
  && {
    border-bottom: 2px solid ${(props) => props.colors?.interactive?.disabledBorder};
    position: sticky;
    top: 0;
    background-color: ${(props) => props.colors?.interactive?.tableHeaderFillResting};
    z-index: 1;
  }
`;

export const TableDataCell = styled(MuiTableCell)<{ type?: ContentType; clickable?: string; colors?: Colors }>`
  position: relative;
  z-index: 0;
  border-right: 1px solid ${(props) => (JSON.stringify(props.colors) == JSON.stringify(light) ? "rgba(224, 224, 224, 1)" : "#007079")};
  white-space: nowrap;
  && {
    color: ${(props) => props.colors.text.staticIconsDefault};
    border-bottom: 1px solid ${(props) => (JSON.stringify(props.colors) == JSON.stringify(light) ? "rgba(224, 224, 224, 1)" : "#007079")};
    font-family: EquinorMedium;
  }
  cursor: ${(props) => (props.clickable === "true" ? "pointer" : "arrow")};
  ${({ type }) =>
    type === ContentType.String &&
    `
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
  `};
`;

export default ContentTable;
