import React, { useCallback, useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import { OperationAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore, { calculateObjectNodeId } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, { calculateObjectGroupId } from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import { pluralize } from "../ContextMenus/ContextMenuUtils";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import ObjectsSidebarContextMenu, { ObjectsSidebarContextMenuProps } from "../ContextMenus/ObjectsSidebarContextMenu";
import ObjectOnWellboreItem from "./ObjectOnWellboreItem";
import TreeItem from "./TreeItem";

interface ObjectGroupItemProps {
  objectsOnWellbore?: ObjectOnWellbore[] | undefined;
  objectType: ObjectType;
  well: Well;
  wellbore: Wellbore;
  ObjectContextMenu?: React.ComponentType<ObjectContextMenuProps>;
  onGroupContextMenu?: (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => void;
}

const ObjectGroupItem = (props: ObjectGroupItemProps): React.ReactElement => {
  const { objectsOnWellbore, objectType, well, wellbore, ObjectContextMenu, onGroupContextMenu } = props;
  const {
    dispatchNavigation,
    navigationState: { selectedObject, selectedObjectGroup }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onSelectObjectGroup = useCallback(() => {
    dispatchNavigation({ type: NavigationType.SelectObjectGroup, payload: { well, wellbore, objectType } });
  }, [well, wellbore, objectType]);

  const isSelected = useCallback(
    (objectType: ObjectType, objectOnWellbore: ObjectOnWellbore) => {
      return selectedObject &&
        selectedObjectGroup === objectType &&
        selectedObject.uid === objectOnWellbore.uid &&
        selectedObject.wellboreUid === objectOnWellbore.wellboreUid &&
        selectedObject.wellUid === objectOnWellbore.wellUid
        ? true
        : undefined;
    },
    [selectedObject, selectedObjectGroup]
  );

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    return onGroupContextMenu == null ? onGenericGroupContextMenu(event, objectType, wellbore, dispatchOperation) : onGroupContextMenu(event, wellbore);
  };

  return (
    <TreeItem nodeId={calculateObjectGroupId(wellbore, objectType)} labelText={pluralize(objectType)} onLabelClick={onSelectObjectGroup} onContextMenu={onContextMenu}>
      {wellbore &&
        objectsOnWellbore &&
        objectsOnWellbore.map((objectOnWellbore) => (
          <ObjectOnWellboreItem
            key={calculateObjectNodeId(objectOnWellbore, objectType)}
            objectOnWellbore={objectOnWellbore}
            objectType={objectType}
            well={well}
            wellbore={wellbore}
            selected={isSelected(objectType, objectOnWellbore)}
            ContextMenu={ObjectContextMenu}
          />
        ))}
    </TreeItem>
  );
};

const onGenericGroupContextMenu = (event: React.MouseEvent<HTMLLIElement>, objectType: ObjectType, wellbore: Wellbore, dispatchOperation: (action: OperationAction) => void) => {
  preventContextMenuPropagation(event);
  const contextMenuProps: ObjectsSidebarContextMenuProps = { wellbore, objectType };
  const position = getContextMenuPosition(event);
  dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <ObjectsSidebarContextMenu {...contextMenuProps} />, position } });
};

export default ObjectGroupItem;
