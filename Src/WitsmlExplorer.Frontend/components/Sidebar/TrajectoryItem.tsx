import React, { useContext } from "react";
import TreeItem from "./TreeItem";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import Trajectory from "../../models/trajectory";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import TrajectoryContextMenu, { TrajectoryContextMenuProps } from "../ContextMenus/TrajectoryContextMenu";
import OperationContext from "../../contexts/operationContext";

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
    navigationState: { selectedServer }
  } = useContext(NavigationContext);

  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, trajectory: Trajectory) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TrajectoryContextMenuProps = { trajectory, selectedServer, dispatchOperation, dispatchNavigation };
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
