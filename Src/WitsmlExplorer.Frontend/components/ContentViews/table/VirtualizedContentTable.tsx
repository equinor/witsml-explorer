import React, { forwardRef, ReactElement, useContext, useState } from "react";
import styled from "styled-components";
import Moment from "react-moment";
import orderBy from "lodash/orderBy";
import { Checkbox, TableCell as MuiTableCell, TableSortLabel } from "@material-ui/core";
import memoizeOne from "memoize-one";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import OperationContext from "../../../contexts/operationContext";
import NavigationContext from "../../../contexts/navigationContext";
import OperationType from "../../../contexts/operationType";
import { DateFormat } from "../../Constants";
import { ContentTableColumn, ContentTableProps, ContentTableRow, ContentType, getCheckedRows, getSelectedRange, Order } from "./tableParts";
import { colors } from "../../../styles/Colors";
import { useTheme } from "@material-ui/core/styles";
import { getContextMenuPosition } from "../../ContextMenus/ContextMenu";
import MnemonicsContextMenu from "../../ContextMenus/MnemonicsContextMenu";
import { LogCurveInfoRow } from "../LogCurveInfoListView";
import { DeleteLogCurveValuesJob, IndexRange } from "../../../models/jobs/deleteLogCurveValuesJob";
import LogObject from "../../../models/logObject";

interface RowProps {
  index: number;
  style: any;
  data: {
    columns: ContentTableColumn[];
    width: number;
    items: any[];
  };
}

const columnRefs: string[] = [];

export const VirtualizedContentTable = (props: ContentTableProps): React.ReactElement => {
  const { columns, data, onSelect, checkableRows } = props;
  const [checkedContentItems, setCheckedContentItems] = useState<ContentTableRow[]>([]);
  const { dispatchOperation } = useContext(OperationContext);
  const { navigationState } = useContext(NavigationContext);
  const { selectedLog, selectedLogCurveInfo } = navigationState;
  const [sortOrder, setSortOrder] = useState<Order>(Order.Ascending);
  const [sortedColumn, setSortedColumn] = useState<string>(columns[0].property);
  const [activeIndexRange, setActiveIndexRange] = useState<number[]>([]);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";

  const sortByColumn = (columnToSort: string) => {
    const flipOrder = (order: Order) => (order === Order.Ascending ? Order.Descending : Order.Ascending);
    const isSameColumn = columnToSort === sortedColumn;
    const order = isSameColumn ? flipOrder(sortOrder) : Order.Ascending;
    setSortOrder(order);
    setSortedColumn(columnToSort);
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

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    const deleteLogCurveValuesJob = getDeleteLogCurveValuesJob(selectedLogCurveInfo, checkedContentItems, selectedLog);
    const contextMenuProps = { deleteLogCurveValuesJob, dispatchOperation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <MnemonicsContextMenu {...contextMenuProps} />, position } });
  };

  const Row = (props: RowProps) => {
    const {
      index,
      style,
      data: { columns, width, items }
    } = props;
    const item = items[index];
    return (
      <div style={style}>
        <RowWrapper key={"Row-" + index} columns={columns} checkableRows={checkableRows} width={width} compactMode={isCompactMode}>
          <TableRow
            key={"TableRow-" + index}
            hover
            onClick={(event) => toggleRow(event, item)}
            onContextMenu={onContextMenu ? (event) => onContextMenu(event) : (e) => e.preventDefault()}
          >
            {checkableRows && (
              <TableDataCell key={`${index}-checkbox`} component={"div"}>
                <Checkbox
                  onClick={(event) => toggleRow(event, item)}
                  checked={
                    checkedContentItems && checkedContentItems.length > 0 && checkedContentItems.findIndex((checkedRow: ContentTableRow) => item.id === checkedRow.id) !== -1
                  }
                />
              </TableDataCell>
            )}
            {columns &&
              columns.map((column) => (
                <TableDataCell
                  id={item[column.property] + column.property}
                  key={column.property + "-" + index}
                  component={"div"}
                  clickable={onSelect ? "true" : "false"}
                  type={column.type}
                  align={column.type === ContentType.Number ? "right" : "left"}
                >
                  {format(column.type, item[column.property])}
                </TableDataCell>
              ))}
          </TableRow>
        </RowWrapper>
      </div>
    );
  };

  const getItemData = memoizeOne((columns, width, data) => ({
    columns,
    width,
    items: orderBy(data, sortedColumn, sortOrder)
  }));

  const ROW_SIZE = isCompactMode ? 32 : 48;
  const itemKey = (index: number, data: any) => data.items[index][columns[0].property];

  const storeCheckboxColumnReference = (ref: any) => {
    if (columnRefs.length > 0) {
      columnRefs[0] = ref;
    } else {
      columnRefs.push(ref);
    }
  };

  const storeColumnReference = (ref: any, index: number) => {
    const offset = checkableRows ? 1 : 0;
    if (columnRefs.length > offset) {
      columnRefs[index + offset] = ref;
    } else {
      columnRefs.push(ref);
    }
  };

  const innerGridElementType = forwardRef<HTMLDivElement, any>(({ children, ...rest }: any, ref) => (
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
              <TableHeaderCell
                component={"div"}
                key={column.property}
                align={column.type === ContentType.Number ? "right" : "left"}
                ref={(ref: any) => storeColumnReference(ref, index)}
              >
                <TableSortLabel active={sortedColumn === column.property} direction={sortOrder} onClick={() => sortByColumn(column.property)}>
                  {column.label}
                </TableSortLabel>
              </TableHeaderCell>
            ))}
        </RowWrapper>
      </TableHeader>
      <DataContainer>{children}</DataContainer>
    </div>
  ));
  innerGridElementType.displayName = "innerGridElementType";

  return (
    <>
      {columns && (
        <>
          {data && (
            <AutoSizer>
              {({ height, width }) => {
                const itemData = getItemData(columns, width, data);

                return (
                  <List height={height} width={width} itemCount={data.length} itemSize={ROW_SIZE} itemKey={itemKey} itemData={itemData} innerElementType={innerGridElementType}>
                    {Row}
                  </List>
                );
              }}
            </AutoSizer>
          )}
        </>
      )}
    </>
  );
};

export const getIndexRanges = (checkedContentItems: ContentTableRow[], selectedLog: LogObject): IndexRange[] => {
  const sortedItems = checkedContentItems.sort((a, b) => (+a.id > +b.id ? 1 : -1));
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

const getDeleteLogCurveValuesJob = (currentSelected: LogCurveInfoRow[], checkedContentItems: ContentTableRow[], selectedLog: LogObject) => {
  const indexRanges = getIndexRanges(checkedContentItems, selectedLog);
  const mnemonics = currentSelected.map((logCurveInfoRow) => logCurveInfoRow.mnemonic);

  const deleteLogCurveValuesJob: DeleteLogCurveValuesJob = {
    logReference: {
      wellUid: selectedLog.wellUid,
      wellboreUid: selectedLog.wellboreUid,
      logUid: selectedLog.uid
    },
    mnemonics: mnemonics,
    indexRanges: indexRanges
  };
  return deleteLogCurveValuesJob;
};

const format = (type: ContentType, data: string | Date): string | ReactElement => {
  switch (type) {
    case ContentType.DateTime:
      return formatDate(data as Date, DateFormat.DATETIME_MS);
    case ContentType.Date:
      return formatDate(data as Date, DateFormat.DATE);
    default:
      return data as string;
  }
};

const formatDate = (date: Date, format: string): string | ReactElement => {
  if (date) {
    return <Moment format={format} date={date} />;
  } else {
    return "";
  }
};

const configureTemplateColumns = memoizeOne((checkableRows: boolean, isHeader: boolean, width: any, columns: ContentTableColumn[]) => {
  let templateColumns = [];

  if (isHeader) {
    if (checkableRows) {
      templateColumns.push("50px");
    }
    const columnWidth = "200px";
    const columnWidths = new Array(columns.length).fill(columnWidth);
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

const RowWrapper = styled.div<RowWrapperProps>`
  display: grid;
  grid-template-columns: ${(props) => configureTemplateColumns(props.checkableRows, props.isHeader, props.width, props.columns)};
  grid-auto-rows: minmax(${(props) => (props.compactMode ? "2rem" : "3rem")}, auto);
  font-size: 0.875rem;
  width: 100%;
`;

const TableHeader = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  line-height: 1.5rem;
  z-index: 3;
`;

const DataContainer = styled.div`
  position: absolute;
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
`;

const TableRow = styled.div<{ hover: boolean }>`
  display: contents;

  &:hover div {
    background-color: ${colors.interactive.tableHeaderFillResting};
  }
`;

const TableDataCell = styled(MuiTableCell)<{ clickable?: string; type?: ContentType }>`
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
    (type === ContentType.Number || type === ContentType.DateTime) &&
    `
    font-feature-settings: "tnum";
  `};
`;
TableDataCell.displayName = "TableDataCell";

export default VirtualizedContentTable;
