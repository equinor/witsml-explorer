import { Button, Icon, Menu, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ContentTableColumn } from ".";
import ModificationType from "../../../contexts/modificationType";
import NavigationContext from "../../../contexts/navigationContext";
import OperationContext from "../../../contexts/operationContext";
import ObjectService from "../../../services/objectService";
import { ColumnOptionsMenu } from "./ColumnOptionsMenu";

export interface PanelProps {
  checkableRows: boolean;
  numberOfItems: number;
  showRefresh?: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
  table?: Table<any>;
  viewId?: string;
  columns?: ContentTableColumn[];
  expandableRows?: boolean;
}

const Panel = (props: PanelProps) => {
  const { checkableRows, panelElements, numberOfCheckedItems, numberOfItems, showRefresh, table, viewId, columns, expandableRows = false } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { selectedWellbore, selectedObjectGroup } = navigationState;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  const selectedItemsText = checkableRows ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;

  const onClickRefresh = async () => {
    setIsRefreshing(true);
    const wellUid = selectedWellbore.wellUid;
    const wellboreUid = selectedWellbore.uid;
    const wellboreObjects = await ObjectService.getObjects(wellUid, wellboreUid, selectedObjectGroup);
    dispatchNavigation({ type: ModificationType.UpdateWellboreObjects, payload: { wellboreObjects, wellUid, wellboreUid, objectType: selectedObjectGroup } });
    setIsRefreshing(false);
  };

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
      <Typography style={{ color: colors.text.staticIconsDefault }}>{selectedItemsText}</Typography>
      {showRefresh && (
        <Button
          key="refreshObject"
          variant="outlined"
          aria-disabled={isRefreshing ? true : false}
          aria-label={isRefreshing ? "loading data" : null}
          onClick={onClickRefresh}
          disabled={isRefreshing}
        >
          <Icon name="refresh" />
          Refresh
        </Button>
      )}
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
