import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore, { calculateObjectNodeId } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TreeItem from "./TreeItem";

interface ObjectOnWellboreItemProps {
  objectOnWellbore: ObjectOnWellbore;
  objectType: ObjectType;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  ContextMenu: React.ComponentType<ObjectContextMenuProps>;
}

const ObjectOnWellboreItem = (props: ObjectOnWellboreItemProps): React.ReactElement => {
  const { objectOnWellbore, objectType, selected, well, wellbore, ContextMenu } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectContextMenuProps = { checkedObjects: [objectOnWellbore], wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <ContextMenu {...contextMenuProps} />, position } });
  };
  const nodeId = calculateObjectNodeId(objectOnWellbore, objectType);
  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={objectOnWellbore.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectObject, payload: { object: objectOnWellbore, wellbore, well, objectType } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
};

export default ObjectOnWellboreItem;
