import React, { useContext } from "react";
import styled from "styled-components";
import { TreeView } from "@material-ui/lab";
import Icon from "../../styles/Icons";
import WellItem from "./WellItem";
import PropertiesPanel from "./PropertiesPanel";
import NavigationContext from "../../contexts/navigationContext";
import ServerManager from "./ServerManager";
import Well from "../../models/well";
import FilterPanel from "./FilterPanel";

const Sidebar = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { filteredWells, expandedTreeNodes, currentProperties } = navigationState;

  return (
    <>
      <ServerManager />
      <FilterPanel />
      <SidebarTreeView>
        {filteredWells && filteredWells.length > 0 && (
          <TreeView
            defaultCollapseIcon={<Icon name="chevronDown" color={"disabled"} />}
            defaultExpandIcon={<Icon name="chevronRight" color={"disabled"} />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            expanded={expandedTreeNodes}
          >
            {filteredWells.map((well: Well) => (
              <WellItem key={well.uid} well={well} />
            ))}
          </TreeView>
        )}
      </SidebarTreeView>
      <PropertiesPanel properties={currentProperties} />
    </>
  );
};

const SidebarTreeView = styled.div`
  overflow-y: scroll;
  flex: 1 1 auto;
  height: 70%;
  padding-left: 0.5rem;
`;

export default Sidebar;
