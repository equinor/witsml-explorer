import { Divider, Typography } from "@equinor/eds-core-react";
import { TreeView } from "@mui/x-tree-view";
import {
  useVirtualizer,
  VirtualItem,
  Virtualizer
} from "@tanstack/react-virtual";
import ProgressSpinner from "components/ProgressSpinner";
import SearchFilter from "components/Sidebar/SearchFilter";
import WellItem from "components/Sidebar/WellItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import { UserTheme } from "contexts/operationStateReducer";
import { useSidebar } from "contexts/sidebarContext";
import { SidebarActionType } from "contexts/sidebarReducer";
import { useGetWells } from "hooks/query/useGetWells";
import { useOperationState } from "hooks/useOperationState";
import { useWellFilter } from "hooks/useWellFilter";
import Well from "models/well";
import { Fragment, SyntheticEvent, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Icon from "styles/Icons";
import { WellIndicator } from "../StyledComponents/WellIndicator";
import {
  InactiveWellsHiddenFilterHelper
} from "./InactiveWellsHiddenFilterHelper";
import { Stack } from "@mui/material";

export default function Sidebar() {
  const { connectedServer } = useConnectedServer();
  const { wells, isFetching } = useGetWells(connectedServer);
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const { wellUid } = useParams();
  const isDeepLink = useRef<boolean>(!!wellUid);
  const {
    operationState: { colors, theme }
  } = useOperationState();
  const isCompactMode = theme === UserTheme.Compact;
  const filteredWells = useWellFilter(wells);
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

  const onNodeToggle = (_: SyntheticEvent, nodeIds: string[]) => {
    if (nodeIds !== expandedTreeNodes) {
      dispatchSidebar({
        type: SidebarActionType.SetTreeNodes,
        payload: { nodeIds }
      });
    }
  };

  if (isFetching) return <>
    <SearchFilter />
    {!!connectedServer && (
      <SidebarTreeView ref={containerRef}>
        <ProgressSpinner message="Fetching wells. This may take some time." />
      </SidebarTreeView>
    )}
  </>;

  return (
    <Fragment>
      <SearchFilter />
      {!!connectedServer && (
        <SidebarTreeView ref={containerRef}>
          {
            filteredWells &&
            (filteredWells.length === 0 ? (
              <Stack gap="1rem" pt="1rem">
                <Typography>
                  No wells match the current filter
                </Typography>
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
                  const well: Well = filteredWells[virtualItem.index];
                  return (
                    <StyledVirtualItem
                      key={well.uid}
                      data-index={virtualItem.index}
                      ref={(node) => virtualizer.measureElement(node)}
                      virtualItem={virtualItem}
                    >
                      <WellListing>
                        <WellItem wellUid={well.uid} />
                        <WellIndicator
                          compactMode={isCompactMode}
                          active={well.isActive}
                          colors={colors}
                        />
                      </WellListing>
                      <Divider
                        style={{
                          margin: "0px",
                          backgroundColor: colors.interactive.disabledBorder
                        }}
                      />
                    </StyledVirtualItem>
                  );
                })}
              </StyledVirtualTreeView>
            ))
          }
        </SidebarTreeView>
      )}
    </Fragment>
  );
}

const WellListing = styled.div`
  display: grid;
  grid-template-columns: 1fr 18px;
  justify-content: center;
  align-content: stretch;
`;

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

const StyledVirtualItem = styled.div.attrs<{ virtualItem: VirtualItem }>(
  (props) => ({
    style: {
      transform: `translateY(${props.virtualItem.start}px)`
    }
  })
)<{ virtualItem: VirtualItem }>`
  position: absolute;
  width: 100%;
`;
