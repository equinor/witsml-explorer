import { Button, Icon, Typography } from "@equinor/eds-core-react";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import ModificationType from "../../../contexts/modificationType";
import NavigationContext from "../../../contexts/navigationContext";
import OperationContext from "../../../contexts/operationContext";
import ObjectService from "../../../services/objectService";

export interface PanelProps {
  showCheckedItems: boolean;
  numberOfItems: number;
  showRefresh?: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
}

const Panel = (props: PanelProps) => {
  const { showCheckedItems, panelElements, numberOfCheckedItems, numberOfItems, showRefresh } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { selectedWellbore, selectedObjectGroup } = navigationState;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const selectedItemsText = showCheckedItems ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;

  const selectedItemsElement = <Typography style={{ color: colors.text.staticIconsDefault }}>{selectedItemsText}</Typography>;

  const onClickRefresh = async () => {
    setIsRefreshing(true);
    const wellUid = selectedWellbore.wellUid;
    const wellboreUid = selectedWellbore.uid;
    const wellboreObjects = await ObjectService.getObjects(wellUid, wellboreUid, selectedObjectGroup);
    dispatchNavigation({ type: ModificationType.UpdateWellboreObjects, payload: { wellboreObjects, wellUid, wellboreUid, objectType: selectedObjectGroup } });
    setIsRefreshing(false);
  };

  const refreshElement = (
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
  );

  return (
    <Div>
      {selectedItemsElement}
      {showRefresh ? refreshElement : null}
      {panelElements}
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 4px;
  white-space: nowrap;
`;

export default Panel;
