import { Button, Menu, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import React, { useState } from "react";
import styled from "styled-components";
import { ContentTableColumn } from ".";
import { ColumnToggle } from "./ColumnToggleContextMenu";

export interface PanelProps {
  showTotalItems: boolean;
  checkableRows: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
  numberOfItems?: number;
  table?: Table<any>;
  viewId?: string;
  columns?: ContentTableColumn[];
  expandableRows?: boolean;
}

const Panel = (props: PanelProps) => {
  const { showTotalItems, checkableRows, panelElements, numberOfCheckedItems, numberOfItems, table, viewId, columns, expandableRows = false } = props;
  if (!showTotalItems && !panelElements) {
    return null;
  }
  const selectedItemsText = checkableRows ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;
  const selectedItemsElement = showTotalItems ? <Typography>{selectedItemsText}</Typography> : null;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  return (
    <Div>
      {/* remove the "table &&" check once Tanstack is the default */}
      {table && (
        <>
          <Button ref={setAnchorEl} id="anchor-default" aria-haspopup="true" aria-expanded={isOpen} aria-controls="menu-default" onClick={() => setIsOpen(!isOpen)}>
            Columns {table.getVisibleLeafColumns().length}/{table.getAllLeafColumns().length}
          </Button>
          {/* Replace the following onClick with custom width defaults if we get them */}
          <Button onClick={() => table.setColumnSizing(Object.assign({}, ...table.getLeafHeaders().map((header) => ({ [header.id]: 150 }))))}>Reset sizing</Button>
          <Menu open={isOpen} id="menu-default" aria-labelledby="anchor-default" onClose={() => setIsOpen(false)} anchorEl={anchorEl} placement="left-end">
            <ColumnToggle checkableRows={checkableRows} table={table} viewId={viewId} columns={columns} expandableRows={expandableRows} />
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
