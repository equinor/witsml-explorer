import Filter, { EMPTY_FILTER } from "../../contexts/filter";
import NavigationType from "../../contexts/navigationType";
import React, { useContext, useEffect, useState } from "react";
import { Checkbox, FormControlLabel as MuiFormControlLabel, TextField as MuiTextField } from "@material-ui/core";
import styled from "styled-components";
import { colors } from "../../styles/Colors";
import NavigationContext from "../../contexts/navigationContext";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const FilterPanel = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedFilter } = navigationState;

  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    setFilter(selectedFilter);
  }, [selectedFilter]);

  return (
    <Container expanded={expanded}>
      <FilterPanelHeader onClick={() => setExpanded(!expanded)}>
        <div>{expanded ? <ExpandMoreIcon color={"disabled"} style={{ width: 18 }} /> : <ChevronRightIcon color={"disabled"} style={{ width: 18 }} />}</div>
        <div>Filter options</div>
      </FilterPanelHeader>
      {expanded && (
        <>
          <SearchTextField
            id="filter-tree"
            label="Filter on well name"
            onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, wellName: event.target.value } } })}
            value={filter.wellName}
            autoComplete={"off"}
          />
          <FormControlLabel
            control={
              <Checkbox
                id="filter-isActive"
                onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, isActive: event.target.checked } } })}
                value={filter.isActive}
              />
            }
            label={"Show only active wells and wellbores"}
          />
          <FormControlLabel
            control={
              <Checkbox
                id="filter-objectGrowing"
                onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, objectGrowing: event.target.checked } } })}
                value={filter.objectGrowing}
              />
            }
            label={"Show only growing logs"}
          />
        </>
      )}
    </Container>
  );
};

const Container = styled.div<{ expanded: boolean }>`
  background-color: ${colors.ui.backgroundLight};
  display: flex;
  flex-direction: column;
  padding: 0.4rem;
  align-items: stretch;
`;

const FilterPanelHeader = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 1.5rem;
  font-family: EquinorMedium, sans-serif;
`;

const SearchTextField = styled(MuiTextField)`
  && {
    margin-left: 0.5rem;
    :hover {
      background-color: ${colors.ui.backgroundDefault};
    }
  }
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  && {
    margin-left 0.4rem;
    :hover {
      background-color: ${colors.ui.backgroundDefault};
    }
  }
`;

export default FilterPanel;
