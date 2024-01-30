import { ComponentType, MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useWellboreItem } from "../../contexts/wellboreItemContext";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { calculateObjectNodeId } from "../../models/wellbore";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TreeItem from "./TreeItem";

interface ObjectOnWellboreItemProps {
  nodeId: string;
  objectOnWellbore: ObjectOnWellbore;
  objectType: ObjectType;
  ContextMenu: ComponentType<ObjectContextMenuProps>;
}

export default function ObjectOnWellboreItem({
  nodeId,
  objectOnWellbore,
  objectType,
  ContextMenu
}: ObjectOnWellboreItemProps) {
  const { wellbore, well } = useWellboreItem();
  const { dispatchOperation } = useContext(OperationContext);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { objectGroup, objectUid } = useParams();

  const onContextMenu = (event: MouseEvent<HTMLLIElement>) => {
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
      selected={
        calculateObjectNodeId(wellbore, objectType, objectOnWellbore.uid) ===
        calculateObjectNodeId(wellbore, objectGroup, objectUid)
      }
      onLabelClick={() => {
        if (
          objectType === ObjectType.MudLog ||
          objectType === ObjectType.Trajectory ||
          objectType === ObjectType.Tubular ||
          objectType === ObjectType.WbGeometry ||
          objectType === ObjectType.FluidsReport
        ) {
          navigate(
            `/servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${
              wellbore.uid
            }/objectgroups/${objectType}/objects/${objectOnWellbore.uid}`
          );
        }
      }}
      onContextMenu={(event: MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
}
