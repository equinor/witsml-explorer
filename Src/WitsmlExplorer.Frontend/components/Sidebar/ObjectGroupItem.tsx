import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import ObjectsSidebarContextMenu, {
  ObjectsSidebarContextMenuProps
} from "components/ContextMenus/ObjectsSidebarContextMenu";
import ObjectOnWellboreItem from "components/Sidebar/ObjectOnWellboreItem";
import TreeItem from "components/Sidebar/TreeItem";
import { WellboreItemContext } from "components/Sidebar/WellboreItem";
import { FilterContext, VisibilityStatus } from "contexts/filter";
import ModificationType from "contexts/modificationType";
import { ToggleTreeNodeAction } from "contexts/navigationActions";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import { OperationAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import ObjectOnWellbore, {
  calculateObjectNodeId
} from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Wellbore, {
  calculateObjectGroupId,
  getObjectsFromWellbore
} from "models/wellbore";
import React, { ReactNode, useCallback, useContext, useState } from "react";
import ObjectService from "services/objectService";

interface ObjectGroupItemProps {
  objectsOnWellbore?: ObjectOnWellbore[] | undefined; //a tree item for each object will be generated if this array is provided
  objectType: ObjectType;
  ObjectContextMenu?: React.ComponentType<ObjectContextMenuProps>; //required only if objectsOnWellbore array is provided
  onGroupContextMenu?: (
    event: React.MouseEvent<HTMLLIElement>,
    wellbore: Wellbore,
    setIsLoading: (arg: boolean) => void
  ) => void;
  children?: ReactNode;
  isActive?: boolean;
}

const ObjectGroupItem = (props: ObjectGroupItemProps): React.ReactElement => {
  const {
    objectsOnWellbore,
    objectType,
    ObjectContextMenu,
    onGroupContextMenu,
    children,
    isActive
  } = props;
  const {
    dispatchNavigation,
    navigationState: { selectedObject, selectedObjectGroup }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { wellbore, well } = useContext(WellboreItemContext);
  const { selectedFilter } = useContext(FilterContext);
  const [isLoading, setIsLoading] = useState(false);

  const onSelectObjectGroup = useCallback(async () => {
    setIsLoading(true);
    const objects = await ObjectService.getObjectsIfMissing(
      wellbore,
      objectType
    );
    dispatchNavigation({
      type: NavigationType.SelectObjectGroup,
      payload: {
        wellUid: well.uid,
        wellboreUid: wellbore.uid,
        objectType,
        objects
      }
    });
    setIsLoading(false);
  }, [well, wellbore, objectType]);

  const toggleTreeNode = useCallback(async () => {
    const objects = getObjectsFromWellbore(wellbore, objectType);
    if (objects == null || objects.length == 0) {
      setIsLoading(true);
      const fetchedObjects = await ObjectService.getObjects(
        wellbore.wellUid,
        wellbore.uid,
        objectType
      );
      dispatchNavigation({
        type: ModificationType.UpdateWellboreObjects,
        payload: {
          wellboreObjects: fetchedObjects,
          wellUid: well.uid,
          wellboreUid: wellbore.uid,
          objectType
        }
      });
      setIsLoading(false);
    }
    const toggleTreeNode: ToggleTreeNodeAction = {
      type: NavigationType.ToggleTreeNode,
      payload: { nodeId: calculateObjectGroupId(wellbore, objectType) }
    };
    dispatchNavigation(toggleTreeNode);
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
    return onGroupContextMenu == null
      ? onGenericGroupContextMenu(
          event,
          objectType,
          wellbore,
          dispatchOperation,
          setIsLoading
        )
      : onGroupContextMenu(event, wellbore, setIsLoading);
  };
  const showStub =
    wellbore.objectCount != null &&
    wellbore.objectCount[objectType] != null &&
    wellbore.objectCount[objectType] != 0;

  return selectedFilter.objectVisibilityStatus[objectType] ==
    VisibilityStatus.Visible ? (
    <TreeItem
      nodeId={calculateObjectGroupId(wellbore, objectType)}
      labelText={pluralize(objectType)}
      onLabelClick={onSelectObjectGroup}
      onContextMenu={onContextMenu}
      isLoading={isLoading}
      onIconClick={toggleTreeNode}
      isActive={isActive}
    >
      {children ||
        (wellbore &&
          objectsOnWellbore &&
          objectsOnWellbore.map((objectOnWellbore) => (
            <ObjectOnWellboreItem
              key={calculateObjectNodeId(objectOnWellbore, objectType)}
              nodeId={calculateObjectNodeId(objectOnWellbore, objectType)}
              objectOnWellbore={objectOnWellbore}
              objectType={objectType}
              selected={isSelected(objectType, objectOnWellbore)}
              ContextMenu={ObjectContextMenu}
            />
          ))) ||
        (showStub && ["", ""])}
    </TreeItem>
  ) : null;
};

const onGenericGroupContextMenu = (
  event: React.MouseEvent<HTMLLIElement>,
  objectType: ObjectType,
  wellbore: Wellbore,
  dispatchOperation: (action: OperationAction) => void,
  setIsLoading: (arg: boolean) => void
) => {
  preventContextMenuPropagation(event);
  const contextMenuProps: ObjectsSidebarContextMenuProps = {
    wellbore,
    objectType,
    setIsLoading
  };
  const position = getContextMenuPosition(event);
  dispatchOperation({
    type: OperationType.DisplayContextMenu,
    payload: {
      component: <ObjectsSidebarContextMenu {...contextMenuProps} />,
      position
    }
  });
};

export default ObjectGroupItem;
