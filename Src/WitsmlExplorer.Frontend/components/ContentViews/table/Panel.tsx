import { Button, Icon, Typography } from "@equinor/eds-core-react";
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
  table: Table<any>;
  viewId?: string;
  columns?: ContentTableColumn[];
  expandableRows?: boolean;
  stickyLeftColumns?: number;
}

const Panel = (props: PanelProps) => {
  const { checkableRows, panelElements, numberOfCheckedItems, numberOfItems, showRefresh, table, viewId, columns, expandableRows = false, stickyLeftColumns } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { selectedWellbore, selectedObjectGroup } = navigationState;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
      <ColumnOptionsMenu checkableRows={checkableRows} table={table} viewId={viewId} columns={columns} expandableRows={expandableRows} stickyLeftColumns={stickyLeftColumns} />
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
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 4px;
  white-space: nowrap;
`;

export default Panel;
