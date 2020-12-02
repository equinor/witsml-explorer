import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { TreeView } from "@material-ui/lab";
import { TextField as MuiTextField } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import WellItem from "./WellItem";
import PropertiesPanel from "./PropertiesPanel";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import ServerManager from "./ServerManager";
import { colors } from "../../styles/Colors";
import Well from "../../models/well";

const Sidebar = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { filteredWells, expandedTreeNodes, currentProperties, selectedFilter } = navigationState;
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    setFilter(selectedFilter);
  }, [selectedFilter]);

  return (
    <>
      <ServerManager />
      <TextField
        id="filter-tree"
        label="Filter wells"
        onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: event.target.value } })}
        value={filter}
        autoComplete={"off"}
      />
      <SidebarTreeView>
        {filteredWells && filteredWells.length > 0 && (
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon color="disabled" />}
            defaultExpandIcon={<ChevronRightIcon color="disabled" />}
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

const TextField = styled(MuiTextField)`
  && {
    background-color: ${colors.ui.backgroundLight};
    margin-left: 0.5rem;
  }
`;

export default Sidebar;
