import { Button, Icon, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ContentTableColumn } from ".";
import ModificationType from "../../../contexts/modificationType";
import { SelectLogTypeActionGraph } from "../../../contexts/navigationActions";
import NavigationContext from "../../../contexts/navigationContext";
import NavigationType from "../../../contexts/navigationType";
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
  const { selectedWellbore, selectedWell, selectedObjectGroup, selectedLogTypeGroup } = navigationState;
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

  const onClickGraph = async () => {

    const action: SelectLogTypeActionGraph = { type: NavigationType.SelectLogTypeGraph, payload: { well: selectedWell, wellbore: selectedWellbore, logTypeGroup: selectedLogTypeGroup, displayGraph: true } };
    dispatchNavigation(action);
  };

  return (
    <Div>
      {table && <ColumnOptionsMenu checkableRows={checkableRows} table={table} viewId={viewId} columns={columns} expandableRows={expandableRows} />}
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
      <Button
        key="showGraph"
        variant="outlined"
        aria-disabled={isRefreshing ? true : false}
        aria-label={isRefreshing ? "loading data" : null}
        onClick={onClickGraph}
        disabled={isRefreshing}
      >
        <Icon name="refresh" />
        Display Graph
      </Button>
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
