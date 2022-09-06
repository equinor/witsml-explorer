import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Tubular from "../../models/tubular";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import TubularSidebarContextMenu, { TubularSidebarContextMenuProps } from "../ContextMenus/TubularSidebarContextMenu";
import TreeItem from "./TreeItem";

interface TubularProps {
  nodeId: string;
  tubular: Tubular;
  tubularGroup: string;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const TubularItem = (props: TubularProps): React.ReactElement => {
  const { tubular, tubularGroup, selected, well, wellbore, nodeId } = props;
  const {
    dispatchNavigation,
    navigationState: { selectedServer, servers }
  } = useContext(NavigationContext);

  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, tubular: Tubular) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TubularSidebarContextMenuProps = { dispatchNavigation, tubular, selectedServer, servers, dispatchOperation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularSidebarContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={tubular.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectTubular, payload: { tubular, wellbore, well, tubularGroup } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event, tubular)}
    />
  );
};

export default TubularItem;
