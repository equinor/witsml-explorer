import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TreeItem from "./TreeItem";
import { WellboreItemContext } from "./WellboreItem";

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
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

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
        if (
          objectType === ObjectType.MudLog ||
          objectType === ObjectType.Trajectory ||
          objectType === ObjectType.Tubular ||
          objectType === ObjectType.WbGeometry ||
          objectType === ObjectType.FluidsReport
        ) {
          const pluralizedObjectType =
            pluralizeObjectType(objectType).toLowerCase();
          navigate(
            `/servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${
              wellbore.uid
            }/objectgroups/${pluralizedObjectType}/objects/${
              objectOnWellbore.uid
            }`
          );
        }
      }}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) =>
        onContextMenu(event)
      }
    />
  );
};

export default ObjectOnWellboreItem;
