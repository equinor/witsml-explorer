import { Typography } from "@equinor/eds-core-react";
import { TreeView } from "@mui/x-tree-view";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import ProgressSpinner from "components/ProgressSpinner";
import SearchFilter from "components/Sidebar/SearchFilter";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useSidebar } from "contexts/sidebarContext";
import { SidebarActionType } from "contexts/sidebarReducer";
import { useGetWells } from "hooks/query/useGetWells";
import { useOperationState } from "hooks/useOperationState";
import { useWellFilter } from "hooks/useWellFilter";
import { FC, SyntheticEvent, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Icon from "styles/Icons";
import { InactiveWellsHiddenFilterHelper } from "./InactiveWellsHiddenFilterHelper";
import { Stack } from "@mui/material";
import SidebarVirtualItem from "./SidebarVirtualItem";
import { calculateWellNodeId } from "../../models/wellbore.tsx";
import { isInAnyCompactMode } from "../../tools/themeHelpers.ts";
import { useGetUidMappingBasicInfos } from "../../hooks/query/useGetUidMappingBasicInfos.tsx";
import { refreshUidMappingBasicInfos } from "../../hooks/query/queryRefreshHelpers.tsx";
import { useQueryClient } from "@tanstack/react-query";

const Sidebar: FC = () => {
  const { connectedServer } = useConnectedServer();
  const { wells, isFetching } = useGetWells(connectedServer);
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const { wellUid } = useParams();
  const isDeepLink = useRef<boolean>(!!wellUid);
  const {
    operationState: { colors, theme }
  } = useOperationState();
  const queryClient = useQueryClient();
  const { uidMappingBasicInfos, isFetching: isFetchingUidMappingBasicInfos } =
    useGetUidMappingBasicInfos();
  const isCompactMode = isInAnyCompactMode(theme);
  const filteredWells = useWellFilter(wells, uidMappingBasicInfos) || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    getScrollElement: () => containerRef.current,
    count: filteredWells?.length,
    overscan: 5,
    estimateSize: () => (isCompactMode ? 33 : 49),
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined
  });

  useEffect(() => {
    // This useEffect is used to scroll a deep-linked well into view.
    if (isDeepLink.current && filteredWells?.length > 0) {
      isDeepLink.current = false;
      const wellIndex = filteredWells.findIndex((well) => well.uid === wellUid);
      virtualizer.scrollToIndex(wellIndex, { align: "start" });
    }
  }, [filteredWells]);

  useEffect(() => {
    if (connectedServer) {
      refreshUidMappingBasicInfos(queryClient);
    }
  }, [connectedServer]);

  const onNodeToggle = (_: SyntheticEvent, nodeIds: string[]) => {
    if (nodeIds !== expandedTreeNodes) {
      dispatchSidebar({
        type: SidebarActionType.SetTreeNodes,
        payload: { nodeIds }
      });
    }
  };

  if (isFetching || isFetchingUidMappingBasicInfos)
    return (
      <>
        <SearchFilter />
        {!!connectedServer && (
          <SidebarTreeView ref={containerRef}>
            <ProgressSpinner message="Fetching wells. This may take some time." />
          </SidebarTreeView>
        )}
      </>
    );

  return (
    <>
      <SearchFilter />
      {!!connectedServer && (
        <SidebarTreeView ref={containerRef}>
          {!filteredWells.length ? (
            <Stack gap="1rem" pt="1rem">
              <Typography>No wells match the current filter</Typography>
              <InactiveWellsHiddenFilterHelper />
            </Stack>
          ) : (
            <StyledVirtualTreeView
              defaultCollapseIcon={
                <Icon
                  name="chevronDown"
                  color={colors.interactive.primaryResting}
                />
              }
              defaultExpandIcon={
                <Icon
                  name="chevronRight"
                  color={colors.interactive.primaryResting}
                />
              }
              defaultEndIcon={<div style={{ width: 24 }} />}
              expanded={expandedTreeNodes}
              onNodeToggle={onNodeToggle}
              virtualizer={virtualizer}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const well = filteredWells[virtualItem.index];
                return (
                  <SidebarVirtualItem
                    key={`item_${virtualItem.key}`}
                    virtualItem={virtualItem}
                    well={well}
                    uidMappingBasicInfos={uidMappingBasicInfos?.filter(
                      (i) => i.sourceWellId === well.uid
                    )}
                    virtualizer={virtualizer}
                    isExpanded={expandedTreeNodes.includes(
                      calculateWellNodeId(well.uid)
                    )}
                  />
                );
              })}
            </StyledVirtualTreeView>
          )}
        </SidebarTreeView>
      )}
    </>
  );
};

export default Sidebar;

const SidebarTreeView = styled.div`
  overflow-y: scroll;
  flex: 1 1 auto;
  height: 70%;
  padding-left: 1em;
  padding-right: 0.3em;

  .MuiTreeItem-root {
    min-width: 0;

    .MuiTreeItem-iconContainer {
      flex: none;
    }

    .MuiTreeItem-label {
      min-width: 0;

      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`;

const StyledVirtualTreeView = styled(TreeView)<{
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}>`
  position: relative;
  width: 100%;
  height: ${(props) => props.virtualizer.getTotalSize()}px;
`;
