import React, { SyntheticEvent, useRef, useState } from "react";
import styled from "styled-components";
import { useOperationState } from "../hooks/useOperationState.tsx";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { isInAnyCompactMode } from "../tools/themeHelpers.ts";
import { Icon } from "@equinor/eds-core-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Wellbore from "../models/wellbore.tsx";
import Well from "../models/well.tsx";

export interface WellboreTreeItem {
  id: string;
  name: string;
  wellbore: Wellbore;
}

export interface WellTreeItem {
  id: string;
  name: string;
  well: Well;
  children: WellboreTreeItem[];
}

interface WellWellboreTreeProps {
  treeData: WellTreeItem[];
  expandedWells: string[];
  onSelectedWellbore: (wellbore: Wellbore) => void;
}

const WellWellboreTree = (props: WellWellboreTreeProps): React.ReactElement => {
  const { treeData, expandedWells, onSelectedWellbore } = props;

  const {
    operationState: { colors, theme }
  } = useOperationState();
  const isCompactMode = isInAnyCompactMode(theme);

  const [expandedWellTreeItems, setExpandedWellTreeItems] =
    useState<string[]>(expandedWells);

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: treeData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => (isCompactMode ? 33 : 49),
    overscan: 5
  });

  const handleWellNodeTogle = (
    _: SyntheticEvent<Element, Event>,
    nodeIds: string[]
  ) => {
    setExpandedWellTreeItems(nodeIds);
  };

  const renderWellWellboreTree = () => {
    return virtualizer.getVirtualItems().map((virtualItem) => {
      // return treeData.map((wti) => {
      const wti = treeData[virtualItem.index];

      return (
        <TreeItem
          key={wti.id}
          nodeId={wti.id}
          label={wti.name}
          onClick={() => onSelectedWellbore(undefined)}
        >
          {wti.children.map((wbti) => (
            <TreeItem
              key={wbti.id}
              nodeId={wbti.id}
              label={wbti.name}
              onClick={() => onSelectedWellbore(wbti.wellbore)}
            ></TreeItem>
          ))}
        </TreeItem>
      );
    });
  };

  return (
    <>
      <ContentLayout ref={containerRef}>
        <TreeView
          aria-label="rich object"
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
          expanded={expandedWellTreeItems}
          onNodeToggle={handleWellNodeTogle}
        >
          {renderWellWellboreTree()}
        </TreeView>
      </ContentLayout>
    </>
  );
};

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 50vh;
  max-height: 50vh;
  overflow-x: scroll;
`;

export default WellWellboreTree;
