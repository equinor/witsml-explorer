import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TreeItem from "./TreeItem";
import { WellboreItemContext } from "./WellboreItem";

interface ObjectOnWellboreItemProps {
  key: string;
  objectOnWellbore: ObjectOnWellbore;
  objectType: ObjectType;
  selected: boolean;
  ContextMenu: React.ComponentType<ObjectContextMenuProps>;
}

const ObjectOnWellboreItem = (props: ObjectOnWellboreItemProps): React.ReactElement => {
  const { key, objectOnWellbore, objectType, selected, ContextMenu } = props;
  const { wellbore, well } = useContext(WellboreItemContext);
  const { dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectContextMenuProps = { checkedObjects: [objectOnWellbore], wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <ContextMenu {...contextMenuProps} />, position } });
  };
  return (
    <TreeItem
      nodeId={key}
      labelText={objectOnWellbore.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectObject, payload: { object: objectOnWellbore, wellbore, well, objectType } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
};

export default ObjectOnWellboreItem;
