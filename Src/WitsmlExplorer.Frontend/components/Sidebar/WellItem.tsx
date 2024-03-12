import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import WellContextMenu, {
  WellContextMenuProps
} from "components/ContextMenus/WellContextMenu";
import { EmptyTreeItem } from "components/Sidebar/EmptyTreeItem";
import TreeItem from "components/Sidebar/TreeItem";
import WellboreItem from "components/Sidebar/WellboreItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useSidebar } from "contexts/sidebarContext";
import { SidebarActionType } from "contexts/sidebarReducer";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbores } from "hooks/query/useGetWellbores";
import { useWellboreFilter } from "hooks/useWellboreFilter";
import Well from "models/well";
import Wellbore, {
  calculateWellNodeId,
  calculateWellboreNodeId
} from "models/wellbore";
import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWellboresViewPath } from "routes/utils/pathBuilder";

interface WellItemProps {
  wellUid: string;
}

export default function WellItem({ wellUid }: WellItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const { servers } = useGetServers();
  const { wellUid: urlWellUid, wellboreUid: urlWellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const { well, isFetching: isFetchingWell } = useGetWell(
    connectedServer,
    wellUid
  );
  const isExpanded = expandedTreeNodes.includes(calculateWellNodeId(wellUid));
  const { wellbores, isFetching: isFetchingWellbores } = useGetWellbores(
    connectedServer,
    wellUid,
    { enabled: isExpanded }
  );
  const filteredWellbores = useWellboreFilter(wellbores);
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
    navigate(getWellboresViewPath(connectedServer?.url, wellUid));
  };

  return (
    well && (
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
        {filteredWellbores?.length > 0 ? (
          filteredWellbores.map((wellbore: Wellbore) => (
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
          ))
        ) : (
          <EmptyTreeItem />
        )}
      </TreeItem>
    )
  );
}
