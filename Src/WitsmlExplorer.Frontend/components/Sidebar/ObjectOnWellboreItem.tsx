import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { calculateObjectNodeId } from "models/wellbore";
import { ComponentType, MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { dispatchOperation } = useContext(OperationContext);
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const { well } = useGetWell(connectedServer, wellUid);
  const {
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectGroup,
    objectUid
  } = useParams();

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
    navigate(
      getObjectViewPath(
        connectedServer?.url,
        well.uid,
        wellbore.uid,
        objectType,
        objectOnWellbore.uid
      )
    );
  };

  return (
    <TreeItem
      nodeId={nodeId}
      labelText={objectOnWellbore.name}
      selected={
        calculateObjectNodeId(wellbore, objectType, objectOnWellbore.uid) ===
        calculateObjectNodeId(
          { wellUid: urlWellUid, uid: urlWellboreUid },
          objectGroup,
          objectUid
        )
      }
      onLabelClick={onLabelClick}
      onContextMenu={(event: MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
}
