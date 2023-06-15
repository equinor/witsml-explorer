import { Button, Menu, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import React, { useState } from "react";
import styled from "styled-components";
import { ColumnToggle } from "./ColumnToggleContextMenu";

export interface PanelProps {
  showTotalItems: boolean;
  checkableRows: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
  numberOfItems?: number;
  table?: Table<any>;
}

const Panel = (props: PanelProps) => {
  const { showTotalItems, checkableRows, panelElements, numberOfCheckedItems, numberOfItems, table } = props;

  const selectedItemsText = checkableRows ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;
  const selectedItemsElement = showTotalItems ? <Typography>{selectedItemsText}</Typography> : null;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <Div>
      {/* remove the "table &&" check once Tanstack is the default */}
      {table && (
        <>
          {" "}
          <Button ref={setAnchorEl} id="anchor-default" aria-haspopup="true" aria-expanded={isOpen} aria-controls="menu-default" onClick={() => setIsOpen(!isOpen)}>
            Columns {table.getVisibleLeafColumns().length}/{table.getAllLeafColumns().length}
          </Button>
          <Menu open={isOpen} id="menu-default" aria-labelledby="anchor-default" onClose={() => setIsOpen(false)} anchorEl={anchorEl} placement="left-end">
            <ColumnToggle checkableRows={checkableRows} table={table} />
          </Menu>
        </>
      )}

      {selectedItemsElement}
      {panelElements}
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 4px;
  white-space: nowrap;
`;

export default Panel;
