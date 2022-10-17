import { TreeView } from "@material-ui/lab";
import React, { useContext } from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import Well from "../../models/well";
import Icon from "../../styles/Icons";
import WellProgress from "../WellProgress";
import FilterPanel from "./FilterPanel";
import PropertiesPanel from "./PropertiesPanel";
import ServerManager from "./ServerManager";
import WellItem from "./WellItem";

const Sidebar = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { filteredWells, expandedTreeNodes, currentProperties, wells } = navigationState;

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
        {wells?.length == 0 && <WellProgress />}
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
