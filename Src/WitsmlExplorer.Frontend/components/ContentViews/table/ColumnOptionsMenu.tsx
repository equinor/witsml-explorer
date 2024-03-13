import { Button, Icon, Menu, Typography } from "@equinor/eds-core-react";
import { Checkbox, useTheme } from "@material-ui/core";
import { Table } from "@tanstack/react-table";
import {
  calculateColumnWidth,
  expanderId,
  selectId
} from "components/ContentViews/table/contentTableUtils";
import {
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table/tableParts";
import { StyledGhostButton } from "components/StyledComponents/Buttons";
import OperationContext from "contexts/operationContext";
import { useLocalStorageState } from "hooks/useLocalStorageState";
import { useContext, useState } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import {
  STORAGE_CONTENTTABLE_ORDER_KEY,
  removeLocalStorageItem
} from "tools/localStorageHelpers";
import { Draggable, DummyDrop } from "../../StyledComponents/DragDropTable";

const lastId = "dummyLastId";

export const ColumnOptionsMenu = (props: {
  table: Table<any>;
  checkableRows: boolean;
  expandableRows: boolean;
  viewId: string;
  columns: ContentTableColumn[];
  stickyLeftColumns: number;
  selectedColumnsStatus: string;
  firstToggleableIndex: number;
}): React.ReactElement => {
  const {
    table,
    checkableRows,
    expandableRows,
    viewId,
    columns,
    stickyLeftColumns,
    selectedColumnsStatus,
    firstToggleableIndex
  } = props;
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const [draggedId, setDraggedId] = useState<string | null>();
  const [draggedOverId, setDraggedOverId] = useState<string | null>();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [, saveOrderToStorage] = useLocalStorageState<string[]>(
    viewId + STORAGE_CONTENTTABLE_ORDER_KEY
  );
  const isCompactMode = useTheme().props.MuiCheckbox?.size === "small";

  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (
      draggedId != null &&
      draggedOverId != null &&
      draggedId != draggedOverId
    ) {
      const order = table.getAllLeafColumns().map((d) => d.id);
      const dragItemIndex = order.findIndex((value) => value == draggedId);
      order.splice(dragItemIndex, 1);
      if (draggedOverId != lastId) {
        const dragOverItemIndex = order.findIndex(
          (value) => value == draggedOverId
        );
        order.splice(dragOverItemIndex, 0, draggedId);
      } else {
        order.push(draggedId);
      }
      table.setColumnOrder(order);
      if (viewId) saveOrderToStorage(order);
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
      if (viewId) saveOrderToStorage(order);
    }
  };

  const onMoveDown = (columnId: string) => {
    const order = table.getAllLeafColumns().map((d) => d.id);
    const index = order.findIndex((value) => value == columnId);
    if (index < order.length - 1) {
      order[index] = order[index + 1];
      order[index + 1] = columnId;
      table.setColumnOrder(order);
      if (viewId) saveOrderToStorage(order);
    }
  };

  const resizeColumns = () => {
    table.setColumnSizing(
      Object.assign(
        {},
        ...table.getLeafHeaders().map((header) => ({
          [header.id]: calculateColumnWidth(
            header.id,
            isCompactMode,
            (header.column.columnDef.meta as { type: ContentType })?.type
          )
        }))
      )
    );
  };

  return (
    <>
      <StyledGhostButton
        variant="ghost_icon"
        ref={setMenuAnchor}
        id="anchor-default"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        aria-controls="menu-default"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        colors={colors}
      >
        <Icon name="filter" />
      </StyledGhostButton>
      <StyledMenu
        open={isMenuOpen}
        id="menu-default"
        aria-labelledby="anchor-default"
        onClose={() => setIsMenuOpen(false)}
        anchorEl={menuAnchor}
        placement="left-end"
        colors={colors}
      >
        <Typography style={{ paddingBottom: "16px" }}>
          {selectedColumnsStatus}
        </Typography>
        <div style={{ display: "flex" }}>
          <Checkbox
            checked={table.getIsAllColumnsVisible()}
            onChange={table.getToggleAllColumnsVisibilityHandler()}
          />
          <Typography
            style={{
              fontFamily: "EquinorMedium",
              fontSize: "0.875rem",
              padding: "0.25rem 0 0 0.25rem"
            }}
          >
            Toggle all
          </Typography>
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
              column.id != expanderId &&
              index >= stickyLeftColumns && (
                <OrderingRow key={column.id}>
                  <Checkbox
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  <OrderingButton
                    variant={"ghost_icon"}
                    onClick={() => onMoveUp(column.id)}
                    disabled={index == firstToggleableIndex}
                  >
                    <Icon name="chevronUp" />
                  </OrderingButton>
                  <OrderingButton
                    variant={"ghost_icon"}
                    onClick={() => onMoveDown(column.id)}
                    disabled={index == table.getAllLeafColumns().length - 1}
                  >
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
                    colors={colors}
                  >
                    <OrderingLabel>
                      {column.columnDef.header.toString()}
                    </OrderingLabel>
                  </Draggable>
                </OrderingRow>
              )
            );
          })}
          <DummyDrop
            onDragEnter={() => setDraggedOverId(lastId)}
            onDragEnd={drop}
            isDraggedOver={lastId == draggedOverId ? 1 : 0}
            colors={colors}
            style={{ marginLeft: "70px" }}
          >
            <div style={{ visibility: "hidden", height: "15px" }}></div>
          </DummyDrop>
        </div>
        <ResetContainer>
          <ResetButton
            onClick={() => {
              table.setColumnOrder([
                ...(checkableRows ? [selectId] : []),
                ...(expandableRows ? [expanderId] : []),
                ...columns.map((column) => column.label)
              ]);
              if (viewId)
                removeLocalStorageItem(viewId + STORAGE_CONTENTTABLE_ORDER_KEY);
            }}
          >
            Reset ordering
          </ResetButton>
          <ResetButton onClick={resizeColumns}>Reset sizing</ResetButton>
        </ResetContainer>
      </StyledMenu>
    </>
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

const ResetContainer = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ResetButton = styled(Button)`
  width: 125px;
`;

const StyledMenu = styled(Menu)<{ colors: Colors }>`
  background: ${(props) => props.colors.ui.backgroundLight};
  p {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  max-height: 90vh;
  overflow-y: scroll;
`;
