import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Trajectory from "../../models/trajectory";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import TrajectorySidebarContextMenu, { TrajectorySidebarContextMenuProps } from "../ContextMenus/TrajectorySidebarContextMenu";
import TreeItem from "./TreeItem";

interface TrajectoryProps {
  nodeId: string;
  trajectory: Trajectory;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const TrajectoryItem = (props: TrajectoryProps): React.ReactElement => {
  const { trajectory, selected, well, wellbore, nodeId } = props;
  const {
    dispatchNavigation,
    navigationState: { selectedServer, servers }
  } = useContext(NavigationContext);

  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, trajectory: Trajectory) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TrajectorySidebarContextMenuProps = { trajectory, selectedServer, dispatchOperation, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TrajectorySidebarContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={trajectory.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectTrajectory, payload: { trajectory, wellbore, well } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event, trajectory)}
    />
  );
};

export default TrajectoryItem;
