import Filter, { EMPTY_FILTER } from "../../contexts/filter";
import NavigationType from "../../contexts/navigationType";
import React, { useContext, useEffect, useState } from "react";
import { Checkbox, Divider, FormControlLabel as MuiFormControlLabel, TextField as MuiTextField } from "@material-ui/core";
import styled from "styled-components";
import { colors } from "../../styles/Colors";
import NavigationContext from "../../contexts/navigationContext";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import CurveThreshold, { DEFAULT_CURVE_THRESHOLD } from "../../contexts/curveThreshold";

const FilterPanel = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedFilter, selectedCurveThreshold } = navigationState;

  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [curveThreshold, setCurveThreshold] = useState<CurveThreshold>(DEFAULT_CURVE_THRESHOLD);

  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    setFilter(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    setCurveThreshold(selectedCurveThreshold);
  }, [selectedCurveThreshold]);

  return (
    <Container expanded={expanded}>
      <FilterPanelHeader onClick={() => setExpanded(!expanded)}>
        <div>{expanded ? <ExpandMoreIcon color={"disabled"} style={{ width: 18 }} /> : <ChevronRightIcon color={"disabled"} style={{ width: 18 }} />}</div>
        <div>Filter options</div>
      </FilterPanelHeader>
      {expanded && (
        <>
          <TextField
            id="filter-tree"
            label="Filter on well name"
            onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, wellName: event.target.value } } })}
            value={filter.wellName}
            autoComplete={"off"}
          />
          <TextField
            id="filter-wellLimit"
            label="Limit number of wells (0 for no limit)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, wellLimit: Number(event.target.value) } } })}
            value={filter.wellLimit}
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
          <Divider />
          <TextField
            id="curveThreshold-time"
            label="Set threshold for time curve (in minutes)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            onChange={(event) =>
              dispatchNavigation({ type: NavigationType.SetCurveThreshold, payload: { curveThreshold: { ...curveThreshold, timeInMinutes: Number(event.target.value) } } })
            }
            value={curveThreshold.timeInMinutes}
            autoComplete={"off"}
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

const TextField = styled(MuiTextField)`
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
