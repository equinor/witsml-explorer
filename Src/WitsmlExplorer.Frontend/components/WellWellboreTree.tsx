import React, { SyntheticEvent } from "react";
import styled from "styled-components";
import { useOperationState } from "../hooks/useOperationState.tsx";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Icon, Typography } from "@equinor/eds-core-react";
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
  onNodeToggle: (_: SyntheticEvent<Element, Event>, nodeIds: string[]) => void;
}

const WellWellboreTree = (props: WellWellboreTreeProps): React.ReactElement => {
  const { treeData, expandedWells, onSelectedWellbore, onNodeToggle } = props;

  const {
    operationState: { colors }
  } = useOperationState();

  const renderWellWellboreTree = () => {
    return treeData.map((wti) => {
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
      <ContentLayout>
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
          expanded={expandedWells}
          onNodeToggle={onNodeToggle}
        >
          {(treeData?.length == 0 && <Typography>No result</Typography>) ||
            (treeData?.length > 35 ? (
              <Typography>
                Too many results found. Please, refine your search.
              </Typography>
            ) : (
              renderWellWellboreTree()
            ))}
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
