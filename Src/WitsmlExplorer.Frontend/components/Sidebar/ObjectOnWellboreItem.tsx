import { ComponentType, MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConnectedServer } from "../../contexts/connectedServerContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetWell } from "../../hooks/query/useGetWell";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
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
  wellUid: string;
  wellboreUid: string;
}

export default function ObjectOnWellboreItem({
  nodeId,
  objectOnWellbore,
  objectType,
  ContextMenu,
  wellUid,
  wellboreUid
}: ObjectOnWellboreItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const { well } = useGetWell(connectedServer, wellUid);
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

  const onLabelClick = () => {
    if (
      objectType === ObjectType.MudLog ||
      objectType === ObjectType.Trajectory ||
      objectType === ObjectType.Tubular ||
      objectType === ObjectType.WbGeometry ||
      objectType === ObjectType.FluidsReport
    ) {
      navigate(
        `/servers/${encodeURIComponent(connectedServer?.url)}/wells/${
          well.uid
        }/wellbores/${wellbore.uid}/objectgroups/${objectType}/objects/${
          objectOnWellbore.uid
        }`
      );
    } else {
      navigate(
        `/servers/${encodeURIComponent(connectedServer?.url)}/wells/${
          well.uid
        }/wellbores/${wellbore.uid}/objectgroups/${objectType}/objects`
      );
    }
  };

  return (
    <TreeItem
      nodeId={nodeId}
      labelText={objectOnWellbore.name}
      selected={
        calculateObjectNodeId(wellbore, objectType, objectOnWellbore.uid) ===
        calculateObjectNodeId(wellbore, objectGroup, objectUid)
      }
      onLabelClick={onLabelClick}
      onContextMenu={(event: MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
}
