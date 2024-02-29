import { Divider, Typography } from "@equinor/eds-core-react";
import { useTheme } from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import SearchFilter from "components/Sidebar/SearchFilter";
import WellItem from "components/Sidebar/WellItem";
import WellProgress from "components/WellProgress";
import { useWellFilter } from "contexts/filter";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import styled, { CSSProp } from "styled-components";
import Icon from "styles/Icons";
import { WellIndicator } from "../StyledComponents/WellIndicator";

const Sidebar = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells, expandedTreeNodes } = navigationState;
  const filteredWells = useWellFilter(
    wells,
    React.useMemo(() => ({ dispatchNavigation }), [])
  );
  const WellListing: CSSProp = {
    display: "grid",
    gridTemplateColumns: "1fr 18px",
    justifyContent: "center",
    alignContent: "stretch"
  };
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  return (
    <React.Fragment>
      <SearchFilter />
      <SidebarTreeView>
        <WellProgress>
          {filteredWells &&
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
                  <React.Fragment key={well.uid}>
                    <div style={WellListing}>
                      <WellItem well={well} />
                      <WellIndicator
                        compactMode={isCompactMode}
                        active={well.wellbores.some(
                          (wellbore: Wellbore) => wellbore.isActive
                        )}
                        colors={colors}
                      />
                    </div>
                    <Divider
                      style={{
                        margin: "0px",
                        backgroundColor: colors.interactive.disabledBorder
                      }}
                    />
                  </React.Fragment>
                ))}
              </TreeView>
            ))}
        </WellProgress>
      </SidebarTreeView>
    </React.Fragment>
  );
};

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

export default Sidebar;
