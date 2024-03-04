import { Divider, Typography } from "@equinor/eds-core-react";
import { useTheme } from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import ProgressSpinner from "components/ProgressSpinner";
import SearchFilter from "components/Sidebar/SearchFilter";
import WellItem from "components/Sidebar/WellItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { useSidebar } from "contexts/sidebarContext";
import { useGetWells } from "hooks/query/useGetWells";
import { useWellFilter } from "hooks/useWellFilter";
import Well from "models/well";
import { Fragment, useContext } from "react";
import styled from "styled-components";
import Icon from "styles/Icons";
import { WellIndicator } from "../StyledComponents/WellIndicator";

export default function Sidebar() {
  const { connectedServer } = useConnectedServer();
  const { wells, isFetching } = useGetWells(connectedServer);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const { expandedTreeNodes } = useSidebar();
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const filteredWells = useWellFilter(wells);

  return (
    <Fragment>
      <SearchFilter />
      {!!connectedServer && (
        <SidebarTreeView>
          {isFetching ? (
            <ProgressSpinner message="Fetching wells. This may take some time." />
          ) : (
            filteredWells &&
            (filteredWells.length === 0 ? (
              <Typography style={{ paddingTop: "1rem" }}>
                No wells match the current filter
              </Typography>
            ) : (
              <TreeView
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
              >
                {filteredWells.map((well: Well) => (
                  <Fragment key={well.uid}>
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
                  </Fragment>
                ))}
              </TreeView>
            ))
          )}
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
