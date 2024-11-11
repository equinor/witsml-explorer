import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { calculateObjectNodeId } from "models/wellbore";
import { ComponentType, MouseEvent } from "react";
import { useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";

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
  const { dispatchOperation } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const {
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectGroup,
    objectUid
  } = useParams();

  const onContextMenu = (event: MouseEvent<HTMLLIElement>) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectContextMenuProps = {
      checkedObjects: [objectOnWellbore]
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <ContextMenu {...contextMenuProps} />, position }
    });
  };

  const getNavPath = () => {
    return getObjectViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      objectType,
      objectOnWellbore.uid
    );
  };

  return (
    <TreeItem
      nodeId={nodeId}
      labelText={objectOnWellbore.name}
      selected={
        calculateObjectNodeId(
          { wellUid, uid: wellboreUid },
          objectType,
          objectOnWellbore.uid
        ) ===
        calculateObjectNodeId(
          { wellUid: urlWellUid, uid: urlWellboreUid },
          objectGroup,
          objectUid
        )
      }
      to={getNavPath()}
      onContextMenu={(event: MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
}
