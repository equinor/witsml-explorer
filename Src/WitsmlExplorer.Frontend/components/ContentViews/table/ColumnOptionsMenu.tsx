import { Button, Icon, Typography } from "@equinor/eds-core-react";
import { Checkbox, useTheme } from "@material-ui/core";
import { Table } from "@tanstack/react-table";
import { useState } from "react";
import styled from "styled-components";
import { colors } from "../../../styles/Colors";
import { ContentTableColumn, ContentType, calculateColumnWidth, expanderId, orderingStorageKey, removeFromStorage, saveToStorage, selectId } from "./tableParts";

export const ColumnOptionsMenu = (props: {
  table: Table<any>;
  checkableRows: boolean;
  expandableRows: boolean;
  viewId: string;
  columns: ContentTableColumn[];
}): React.ReactElement => {
  const { table, checkableRows, expandableRows, viewId, columns } = props;
  const firstToggleableIndex = (checkableRows ? 1 : 0) + (expandableRows ? 1 : 0);
  const [draggedId, setDraggedId] = useState<string | null>();
  const [draggedOverId, setDraggedOverId] = useState<string | null>();
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";

  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedId != null && draggedOverId != null) {
      const order = table.getAllLeafColumns().map((d) => d.id);
      const dragItemIndex = order.findIndex((value) => value == draggedId);
      const dragOverItemIndex = order.findIndex((value) => value == draggedOverId);
      order[dragItemIndex] = draggedOverId;
      order[dragOverItemIndex] = draggedId;
      table.setColumnOrder(order);
      saveToStorage(viewId, orderingStorageKey, order);
    }
    setDraggedId(null);
    setDraggedOverId(null);
  };

  const onMoveUp = (columnId: string) => {
    const order = table.getAllLeafColumns().map((d) => d.id);
    const index = order.findIndex((value) => value == columnId);
    if (index > firstToggleableIndex) {
      order[index] = order[index - 1];
      order[index - 1] = columnId;
      table.setColumnOrder(order);
      saveToStorage(viewId, orderingStorageKey, order);
    }
  };

  const onMoveDown = (columnId: string) => {
    const order = table.getAllLeafColumns().map((d) => d.id);
    const index = order.findIndex((value) => value == columnId);
    if (index < order.length - 1) {
      order[index] = order[index + 1];
      order[index + 1] = columnId;
      table.setColumnOrder(order);
      saveToStorage(viewId, orderingStorageKey, order);
    }
  };

  const resizeColumns = () => {
    table.setColumnSizing(
      Object.assign(
        {},
        ...table.getLeafHeaders().map((header) => ({ [header.id]: calculateColumnWidth(header.id, isCompactMode, (header.column.columnDef.meta as { type: ContentType })?.type) }))
      )
    );
  };

  return (
    <div style={{ padding: "0.25rem 0.5rem 0.25rem 0.5rem" }}>
      <div style={{ display: "flex" }}>
        <Checkbox checked={table.getIsAllColumnsVisible()} onChange={table.getToggleAllColumnsVisibilityHandler()} />
        <Typography style={{ fontFamily: "EquinorMedium", fontSize: "0.875rem", padding: "0.25rem 0 0 0.25rem" }}>Toggle all</Typography>
      </div>
      {/* set onDragOver and onDrop on an outer div so that the mouse cursor properly detect a drop area, has an annoying flicker tho */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
        }}
        style={{ padding: "0.125rem 0 0.25rem 0" }}
      >
        {table.getAllLeafColumns().map((column, index) => {
          return (
            column.id != selectId &&
            column.id != expanderId && (
              <OrderingRow key={column.id}>
                <Checkbox checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
                <OrderingButton variant={"ghost_icon"} onClick={() => onMoveUp(column.id)} disabled={index == firstToggleableIndex}>
                  <Icon name="chevronUp" />
                </OrderingButton>
                <OrderingButton variant={"ghost_icon"} onClick={() => onMoveDown(column.id)} disabled={index == table.getAllLeafColumns().length - 1}>
                  <Icon name="chevronDown" />
                </OrderingButton>
                <Draggable
                  onDragStart={() => setDraggedId(column.id)}
                  onDragEnter={() => setDraggedOverId(column.id)}
                  onDragEnd={drop}
                  draggable
                  isDragged={column.id == draggedId ? 1 : 0}
                  isDraggedOver={column.id == draggedOverId ? 1 : 0}
                  draggingStarted={draggedId != null ? 1 : 0}
                >
                  <OrderingLabel>{column.columnDef.header.toString()}</OrderingLabel>
                </Draggable>
              </OrderingRow>
            )
          );
        })}
      </div>
      <ResetContainer>
        <ResetButton
          onClick={() => {
            table.setColumnOrder([...(checkableRows ? [selectId] : []), ...(expandableRows ? [expanderId] : []), ...columns.map((column) => column.label)]);
            removeFromStorage(viewId, orderingStorageKey);
          }}
        >
          Reset ordering
        </ResetButton>
        <ResetButton onClick={resizeColumns}>Reset sizing</ResetButton>
      </ResetContainer>
    </div>
  );
};

const OrderingRow = styled.div`
  display: grid;
  grid-template-columns: 20px 25px 25px 1fr;
  align-items: center;
`;

const OrderingButton = styled(Button)`
  width: 25px;
  height: 25px;
`;

const OrderingLabel = styled(Typography)`
  margin-top: auto;
  margin-bottom: auto;
  cursor: grab;
  font-family: EquinorMedium;
  font-size: 0.875rem;
`;

const Draggable = styled.div<{ isDragged?: number; isDraggedOver?: number; draggingStarted?: number }>`
  cursor: grab;
  user-select: none;
  height: 100%;
  display: flex;
  ${(props) => (props.isDragged ? `&&&{ background: ${colors.interactive.textHighlight}; }` : "")}
  ${(props) => (props.isDraggedOver ? `&&&{ background: ${colors.interactive.tableCellFillActivated}; }` : "")}
  ${(props) => (props.draggingStarted ? "" : `&:hover { background: ${colors.interactive.textHighlight}; }`)}
`;

const ResetContainer = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ResetButton = styled(Button)`
  width: 125px;
`;
