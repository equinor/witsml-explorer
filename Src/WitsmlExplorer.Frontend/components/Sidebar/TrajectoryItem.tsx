import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Trajectory from "../../models/trajectory";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TrajectoryContextMenu from "../ContextMenus/TrajectoryContextMenu";
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
  const { dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, trajectory: Trajectory) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectContextMenuProps = { checkedObjects: [trajectory], wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TrajectoryContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={trajectory.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectObject, payload: { object: trajectory, wellbore, well, objectType: ObjectType.Trajectory } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event, trajectory)}
    />
  );
};

export default TrajectoryItem;
