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
import OperationType from "contexts/operationType";
import { useSidebar } from "contexts/sidebarContext";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbores } from "hooks/query/useGetWellbores";
import { useOperationState } from "hooks/useOperationState";
import { useWellboreFilter } from "hooks/useWellboreFilter";
import Well from "models/well";
import Wellbore, {
  calculateWellboreNodeId,
  calculateWellNodeId
} from "models/wellbore";
import React, { MouseEvent } from "react";
import { useParams } from "react-router-dom";
import { getWellboresViewPath } from "routes/utils/pathBuilder";
import { getStyles } from "./styles.ts";
import { UidMappingBasicInfo } from "../../../models/uidMapping.tsx";

interface WellItemProps {
  wellUid: string;
  uidMappingBasicInfos: UidMappingBasicInfo[];
}

export default function WellItem({
  wellUid,
  uidMappingBasicInfos
}: WellItemProps) {
  const {
    dispatchOperation,
    operationState: { theme }
  } = useOperationState();
  const { servers } = useGetServers();
  const { wellUid: urlWellUid, wellboreUid: urlWellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { expandedTreeNodes } = useSidebar();
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

  const generatedSx = getStyles(theme);

  const filteredWellbores = useWellboreFilter(wellbores, uidMappingBasicInfos);
  const isFetching = isFetchingWell || isFetchingWellbores;

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

  if (!well) return null;

  return (
    <TreeItem
      onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
        onContextMenu(event, well)
      }
      selected={
        calculateWellNodeId(wellUid) === calculateWellNodeId(urlWellUid)
      }
      key={wellUid}
      labelText={well?.name}
      nodeId={calculateWellNodeId(wellUid)}
      isLoading={isFetching}
      to={getWellboresViewPath(connectedServer?.url, wellUid)}
      sx={generatedSx}
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
            uidMappingBasicInfos={uidMappingBasicInfos?.filter(
              (i) => i.sourceWellboreId === wellbore.uid
            )}
          />
        ))
      ) : (
        <EmptyTreeItem />
      )}
    </TreeItem>
  );
}
