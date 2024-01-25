import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TreeItem from "components/Sidebar/TreeItem";
import { WellboreItemContext } from "components/Sidebar/WellboreItem";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import React, { useContext } from "react";

interface ObjectOnWellboreItemProps {
  nodeId: string;
  objectOnWellbore: ObjectOnWellbore;
  objectType: ObjectType;
  selected: boolean;
  ContextMenu: React.ComponentType<ObjectContextMenuProps>;
}

const ObjectOnWellboreItem = (
  props: ObjectOnWellboreItemProps
): React.ReactElement => {
  const { nodeId, objectOnWellbore, objectType, selected, ContextMenu } = props;
  const { wellbore, well } = useContext(WellboreItemContext);
  const { dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectContextMenuProps = {
      checkedObjects: [objectOnWellbore],
      wellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <ContextMenu {...contextMenuProps} />, position }
    });
  };
  return (
    <TreeItem
      nodeId={nodeId}
      labelText={objectOnWellbore.name}
      selected={selected}
      onLabelClick={() => {
        if (objectType === ObjectType.Rig) {
          dispatchNavigation({
            type: NavigationType.SelectObjectGroup,
            payload: {
              wellUid: well.uid,
              wellboreUid: wellbore.uid,
              objectType: objectType,
              objects: null
            }
          });
        } else {
          dispatchNavigation({
            type: NavigationType.SelectObject,
            payload: { object: objectOnWellbore, wellbore, well, objectType }
          });
        }
      }}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) =>
        onContextMenu(event)
      }
    />
  );
};

export default ObjectOnWellboreItem;
