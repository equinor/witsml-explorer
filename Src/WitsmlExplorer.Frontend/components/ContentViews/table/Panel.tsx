import { Button, Menu, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import React, { useState } from "react";
import styled from "styled-components";
import { ContentTableColumn } from ".";
import { ColumnOptionsMenu } from "./ColumnOptionsMenu";

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
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  const selectedItemsText = checkableRows ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;
  const selectedItemsElement = showTotalItems ? <Typography>{selectedItemsText}</Typography> : null;
  return (
    <Div>
      {/* remove the "table &&" check once Tanstack is the default */}
      {table && (
        <>
          <Button ref={setMenuAnchor} id="anchor-default" aria-haspopup="true" aria-expanded={isMenuOpen} aria-controls="menu-default" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            Columns {table.getVisibleLeafColumns().length}/{table.getAllLeafColumns().length}
          </Button>
          <Menu open={isMenuOpen} id="menu-default" aria-labelledby="anchor-default" onClose={() => setIsMenuOpen(false)} anchorEl={menuAnchor} placement="left-end">
            <ColumnOptionsMenu checkableRows={checkableRows} table={table} viewId={viewId} columns={columns} expandableRows={expandableRows} />
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
