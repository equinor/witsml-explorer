import { Divider, Typography } from "@equinor/eds-core-react";
import { useTheme } from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import { Fragment, useContext, useMemo } from "react";
import styled from "styled-components";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useWellFilter } from "../../contexts/filter";
import OperationContext from "../../contexts/operationContext";
import { useSidebar } from "../../contexts/sidebarContext";
import { useGetWells } from "../../hooks/query/useGetWells";
import Well from "../../models/well";
import { AuthorizationStatus } from "../../services/authorizationService";
import { Colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import ProgressSpinner from "../ProgressSpinner";
import SearchFilter from "./SearchFilter";
import WellItem from "./WellItem";

// TODO: We need to find a way to show the current well in the sidebar when first deep-linking even if it's not within the top x wells.
export default function Sidebar() {
  const { authorizationState } = useAuthorizationState();
  const { wells, isFetching } = useGetWells(authorizationState?.server, {
    enabled: authorizationState?.status === AuthorizationStatus.Authorized
  });
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const filteredWells = useWellFilter(
    wells,
    useMemo(() => ({ dispatchSidebar }), [])
  );

  return (
    <Fragment>
      <SearchFilter />
      {authorizationState?.status === AuthorizationStatus.Authorized && (
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

export const WellIndicator = styled.div<{
  compactMode: boolean;
  active: boolean;
  colors: Colors;
}>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: ${(props) =>
    props.compactMode ? "0.625rem 0 0 0.5rem" : "1.125rem 0 0 0.5rem"};
  ${(props) =>
    props.active
      ? `background-color: ${props.colors.interactive.successHover};`
      : `border: 2px solid ${props.colors.text.staticIconsTertiary};`}
`;
