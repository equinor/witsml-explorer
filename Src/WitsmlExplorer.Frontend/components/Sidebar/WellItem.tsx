import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useServers } from "../../contexts/serversContext";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { useGetWell } from "../../hooks/query/useGetWell";
import { useGetWellbores } from "../../hooks/query/useGetWellbores";
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
  wellUid: string;
}

export default function WellItem({ wellUid }: WellItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const { servers } = useServers();
  const { wellUid: urlWellUid, wellboreUid: urlWellboreUid } = useParams();
  const { authorizationState } = useAuthorizationState();
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const { well, isFetching: isFetchingWell } = useGetWell(
    // TODO: Note: This only works because each WellItem is not rendered while useGetWells is fetching. Otherwise, we would request all wells individually in parallel.
    authorizationState?.server,
    wellUid
  );
  const isExpanded = expandedTreeNodes.includes(calculateWellNodeId(wellUid));
  const { wellbores, isFetching: isFetchingWellbores } = useGetWellbores(
    authorizationState?.server,
    wellUid,
    { enabled: isExpanded }
  );
  const isFetching = isFetchingWell || isFetchingWellbores;
  const navigate = useNavigate();

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

  const onIconClick = () => {
    dispatchSidebar({
      type: SidebarActionType.ToggleTreeNode,
      payload: { nodeId: calculateWellNodeId(wellUid) }
    });
  };

  const onSelectWell = () => {
    navigate(
      `servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores`
    );
  };

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, well)}
      selected={
        calculateWellNodeId(wellUid) === calculateWellNodeId(urlWellUid)
      }
      key={wellUid}
      labelText={well?.name}
      nodeId={calculateWellNodeId(wellUid)}
      onLabelClick={onSelectWell}
      onIconClick={onIconClick}
      isLoading={isFetching}
    >
      {wellbores?.map((wellbore: Wellbore) => (
        <WellboreItem
          wellUid={wellbore.wellUid}
          wellboreUid={wellbore.uid}
          selected={
            calculateWellboreNodeId({
              wellUid: wellUid,
              uid: wellbore.uid
            }) ===
            calculateWellboreNodeId({
              wellUid: urlWellUid,
              uid: urlWellboreUid
            })
          }
          key={calculateWellboreNodeId(wellbore)}
          nodeId={calculateWellboreNodeId(wellbore)}
        />
      )) || ["", ""]}
    </TreeItem>
  );
}
