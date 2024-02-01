import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useWellFilter } from "../../contexts/filter";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useServers } from "../../contexts/serversContext";
import Well from "../../models/well";
import Wellbore, {
  calculateWellNodeId,
  calculateWellboreNodeId
} from "../../models/wellbore";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import WellContextMenu, {
  WellContextMenuProps
} from "../ContextMenus/WellContextMenu";
import TreeItem from "./TreeItem";
import WellboreItem from "./WellboreItem";

interface WellItemProps {
  well: Well;
}

export default function WellItem({ well }: WellItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const { servers } = useServers();
  const { wellUid, wellboreUid } = useParams();
  const [wellWithFilteredWellbores] = useWellFilter(
    React.useMemo(() => [well], [well]),
    React.useMemo(() => ({ filterWellbores: true }), [])
  );
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    well: Well
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellContextMenuProps = {
      well,
      servers,
      dispatchOperation
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WellContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onSelectWell = (well: Well) => {
    navigate(
      `servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        well.uid
      }/wellbores`
    );
  };

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, well)}
      selected={calculateWellNodeId(well.uid) === calculateWellNodeId(wellUid)}
      key={well.uid}
      labelText={well.name}
      nodeId={calculateWellNodeId(well.uid)}
      onLabelClick={() => onSelectWell(well)}
    >
      {wellWithFilteredWellbores?.wellbores?.map((wellbore: Wellbore) => (
        <WellboreItem
          well={well}
          wellbore={wellbore}
          selected={
            calculateWellboreNodeId({
              wellUid: well.uid,
              uid: wellbore.uid
            }) === calculateWellboreNodeId({ wellUid, uid: wellboreUid })
          }
          key={calculateWellboreNodeId(wellbore)}
          nodeId={calculateWellboreNodeId(wellbore)}
        />
      ))}
    </TreeItem>
  );
}
