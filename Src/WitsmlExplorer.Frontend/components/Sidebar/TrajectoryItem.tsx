import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Trajectory from "../../models/trajectory";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import TrajectoryContextMenu, { TrajectoryContextMenuProps } from "../ContextMenus/TrajectoryContextMenu";
import TreeItem from "./TreeItem";

interface TrajectoryProps {
  nodeId: string;
  trajectory: Trajectory;
  trajectoryGroup: string;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const TrajectoryItem = (props: TrajectoryProps): React.ReactElement => {
  const { trajectory, trajectoryGroup, selected, well, wellbore, nodeId } = props;
  const {
    dispatchNavigation,
    navigationState: { selectedServer, servers }
  } = useContext(NavigationContext);

  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, trajectory: Trajectory) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TrajectoryContextMenuProps = { trajectory, selectedServer, dispatchOperation, dispatchNavigation, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TrajectoryContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={trajectory.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectTrajectory, payload: { trajectory, wellbore, well, trajectoryGroup } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event, trajectory)}
    />
  );
};

export default TrajectoryItem;
