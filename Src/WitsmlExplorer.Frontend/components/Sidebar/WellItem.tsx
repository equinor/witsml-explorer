import React, { useContext } from "react";
import TreeItem from "./TreeItem";
import WellboreItem from "./WellboreItem";
import Well from "../../models/well";
import Wellbore, { calculateWellboreNodeId } from "../../models/wellbore";
import WellContextMenu, { WellContextMenuProps } from "../ContextMenus/WellContextMenu";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import OperationContext from "../../contexts/operationContext";
import { Server } from "../../models/server";

interface WellItemProps {
  well: Well;
}

const WellItem = (props: WellItemProps): React.ReactElement => {
  const { well } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedWell, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, well: Well, servers: Server[]) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellContextMenuProps = { well, servers, dispatchOperation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellContextMenu {...contextMenuProps} />, position } });
  };

  const onSelectWell = async (well: Well) => {
    dispatchNavigation({ type: NavigationType.SelectWell, payload: { well, wellbores: well.wellbores } });
  };

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, well, servers)}
      selected={selectedWell?.uid === well.uid ? true : undefined}
      key={well.uid}
      labelText={well.name}
      nodeId={well.uid}
      onLabelClick={() => onSelectWell(well)}
      isActive={well.wellbores.some((wellbore) => wellbore.isActive === "true" || wellbore.isActive === "1")}
    >
      {well &&
        well.wellbores &&
        well.wellbores.map((wellbore: Wellbore) => (
          <WellboreItem
            well={well}
            wellbore={wellbore}
            selected={selectedWellbore?.uid === wellbore.uid ? true : undefined}
            key={calculateWellboreNodeId(wellbore)}
            nodeId={calculateWellboreNodeId(wellbore)}
          />
        ))}
    </TreeItem>
  );
};

export default WellItem;
