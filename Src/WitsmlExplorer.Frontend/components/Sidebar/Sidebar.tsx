import { Divider } from "@equinor/eds-core-react";
import { useTheme } from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import React, { useContext } from "react";
import styled, { CSSProp } from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import WellProgress from "../WellProgress";
import SearchFilter from "./SearchFilter";
import WellItem from "./WellItem";

const Sidebar = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { filteredWells, expandedTreeNodes } = navigationState;
  const WellListing: CSSProp = { display: "grid", gridTemplateColumns: "1fr 25px", justifyContent: "center", alignContent: "stretch" };
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";

  return (
    <React.Fragment>
      <SearchFilter />
      <SidebarTreeView className="sideBarView">
        <WellProgress>
          {filteredWells && filteredWells.length > 0 && (
            <TreeView
              defaultCollapseIcon={<Icon name="chevronDown" color={colors.interactive.primaryResting} />}
              defaultExpandIcon={<Icon name="chevronRight" color={colors.interactive.primaryResting} />}
              defaultEndIcon={<div style={{ width: 24 }} />}
              expanded={expandedTreeNodes}
            >
              {filteredWells.map((well: Well, index: number) => (
                <React.Fragment key={index}>
                  <div style={WellListing} className="ListWells">
                    <WellItem key={well.uid} well={well} />
                    {well.wellbores.some((wellbore: Wellbore) => wellbore.isActive) ? (
                      <ActiveWellIndicator compactMode={isCompactMode} />
                    ) : (
                      <InactiveWellInidcator compactMode={isCompactMode} />
                    )}
                  </div>
                  <Divider style={{ margin: "0px" }} key={index} />
                </React.Fragment>
              ))}
            </TreeView>
          )}
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
`;

const ActiveWellIndicator = styled.div<{ compactMode: boolean }>`
  width: 14px;
  height: 14px;
  background-color: ${colors.interactive.successHover};
  border-radius: 50%;
  margin-top: ${(props) => (props.compactMode ? "0.5rem" : "1rem")};
`;

const InactiveWellInidcator = styled.div<{ compactMode: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: ${(props) => (props.compactMode ? "0.5rem" : "1rem")};
  border: 2px solid ${colors.text.staticIconsTertiary};
`;
export default Sidebar;
