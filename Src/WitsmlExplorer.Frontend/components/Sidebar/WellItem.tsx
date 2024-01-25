import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import WellContextMenu, {
  WellContextMenuProps
} from "components/ContextMenus/WellContextMenu";
import TreeItem from "components/Sidebar/TreeItem";
import WellboreItem from "components/Sidebar/WellboreItem";
import { useWellFilter } from "contexts/filter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import Well from "models/well";
import Wellbore, { calculateWellboreNodeId } from "models/wellbore";
import React, { useContext } from "react";

interface WellItemProps {
  well: Well;
}

const WellItem = (props: WellItemProps): React.ReactElement => {
  const { well } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedWell, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [wellWithFilteredWellbores] = useWellFilter(
    React.useMemo(() => [well], [well]),
    React.useMemo(() => ({ filterWellbores: true }), [])
  );
  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    well: Well
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellContextMenuProps = {
      well,
      servers,
      dispatchOperation
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WellContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onSelectWell = async (well: Well) => {
    dispatchNavigation({ type: NavigationType.SelectWell, payload: { well } });
  };

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, well)}
      selected={selectedWell?.uid === well.uid ? true : undefined}
      key={well.uid}
      labelText={well.name}
      nodeId={well.uid}
      onLabelClick={() => onSelectWell(well)}
    >
      {wellWithFilteredWellbores?.wellbores?.map((wellbore: Wellbore) => (
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
