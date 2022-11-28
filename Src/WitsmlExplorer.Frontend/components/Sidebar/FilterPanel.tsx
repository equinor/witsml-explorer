import { Checkbox, Divider, FormControlLabel as MuiFormControlLabel, TextField as MuiTextField } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import CurveThreshold, { DEFAULT_CURVE_THRESHOLD } from "../../contexts/curveThreshold";
import Filter, { EMPTY_FILTER } from "../../contexts/filter";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { colors } from "../../styles/Colors";
import { Typography } from "@equinor/eds-core-react";
import {WellboreObjects} from "../../contexts/wellboreObjects"

const FilterPanel = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedFilter, selectedCurveThreshold } = navigationState;

  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [curveThreshold, setCurveThreshold] = useState<CurveThreshold>(DEFAULT_CURVE_THRESHOLD);

  const [showMore, setShowmore] = useState<boolean>(false);
  const Styles = {
    ListWellborObj: { display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "12px", height: "calc(100vh - 387px)", overflowY: "scroll" as "scroll", paddingLeft: '1.5rem' },
    WellboreObject: { display: "grid", gridTemplateColumns: "1fr 80px", alignItems: "baseline", userSelect: "none" as "none", color: "{colors.interactive.primaryResting}", paddingLeft: '0.8rem', paddingBottom: '0.5rem' },
    WellFilterText: { padding: "0.3rem 0 0.3rem 1.4rem", userSelect: "none" as "none"},
   }

  useEffect(() => {
    setFilter(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    setCurveThreshold(selectedCurveThreshold);
  }, [selectedCurveThreshold]);

  const wellObjectList = Object.keys(WellboreObjects).map((wellObj: string, index: number) => {
    return (
      <FormControlLabel key={index}
        control={<Checkbox
         key = {wellObj}
          id={'wellobj'+index}
          value={wellObj}
          color={"primary"}
          defaultChecked={true}
        />}
        label={wellObj} />
    )
  });
  return (
    <Container style={{ boxShadow: !showMore ? "1px 4px 5px 0px #8888" : "none"}}>
      {
        <>
          <div style={Styles.WellboreObject}>
            <span style={{ display: 'flex', gap: '7px' }} >
              <Typography
                token={{ fontFamily: 'EquinorMedium', fontSize: '0.875rem', color: colors.interactive.primaryResting }}>
                Limit number of wells
              </Typography>
              <Typography
                token={{ fontStyle: 'italic', fontFamily: 'EquinorRegular', fontSize: '0.75rem', color: colors.text.staticIconsTertiary }}>
                (0 for no limit)
              </Typography> 
            </span>
            <TextField
              id="filter-wellLimit"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, wellLimit: Number(event.target.value) } } })}
              value={filter.wellLimit}
              autoComplete={"off"}
              variant="standard"
            />
          </div>
          <Divider />
          <div style={Styles.WellFilterText}>
            <FormControlLabel
              control={
                <Checkbox
                  id="filter-isActive"
                  onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, isActive: event.target.checked } } })}
                  value={filter.isActive}
                  color={"primary"}
                />
              }
              label={"Show active Wells / Wellbores"}
            />
          </div>
          <div style={Styles.WellFilterText}>
            <FormControlLabel
              control={
                <Checkbox
                  id="filter-objectGrowing"
                  onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, objectGrowing: event.target.checked } } })}
                  value={filter.objectGrowing}
                  color={"primary"}
                />
              }
              label={"Show growing logs"}
            />
          </div>
          <div style={Styles.WellboreObject}>
            <span style={{ display: 'flex', gap: '7px' }}>
              <Typography token={{ fontSize: '0.75rem', fontFamily: 'EquinorMedium', color: colors.text.staticIconsTertiary }}
                style={{ display: 'flex', gap: '7px' }}>
                Set threshold for time curve </Typography>
              <Typography token={{ fontStyle: 'italic', fontFamily: 'EquinorRegular', fontSize: '0.75rem', color: colors.text.staticIconsTertiary }}> (minutes) </Typography>
            </span>

            <TextField
              id="curveThreshold-time"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              onChange={(event) =>
                dispatchNavigation({ type: NavigationType.SetCurveThreshold, payload: { curveThreshold: { ...curveThreshold, timeInMinutes: Number(event.target.value) } } })
              }
              value={curveThreshold.timeInMinutes}
              autoComplete={"off"}
            />
          </div>
        
          <div style={Styles.WellFilterText}>
            <FormControlLabel
              control={
                <Checkbox
                  id="curveThreshold-hideInactive"
                  onChange={(event) =>
                    dispatchNavigation({ type: NavigationType.SetCurveThreshold, payload: { curveThreshold: { ...curveThreshold, hideInactiveCurves: event.target.checked } } })
                  }
                  value={curveThreshold}
                  color={"primary"}
                />
              }
              label={"Hide inactive time curves"}
            />
          </div>

        </>
      }
      
        {
          <Typography
            token={{ fontSize: " 0.85rem", fontStyle: "italic", fontFamily: 'EquinorMedium', color: colors.interactive.primaryResting }}
            style={{ padding: "0.5rem 0 0 0.8rem", userSelect: "none", cursor: "pointer" }}
            onClick={() => { setShowmore(!showMore) }}>
            { showMore ? " Hide more settings" : "Show more settings" }
          </Typography>
        }
      {
        showMore ?
          <>
            < Typography style={{ paddingLeft: "0.8rem", paddingTop: "1em" }}
              token={{ fontSize: "1rem", fontFamily: "EquinorMedium", color: colors.interactive.primaryResting, }}> Well Objects </ Typography> : <></>
            <span style={Styles.ListWellborObj}> {(wellObjectList)} </span>
        </> : <></>
      }
    </Container>
  );
};

const Container = styled.div`
  background-color: ${colors.ui.backgroundLight};
  padding-bottom:0.5em;
`;

const TextField = styled(MuiTextField)`
  && {
    width:80%;
    margin-left: 0.5rem;
    color: ${colors.interactive.primaryResting};
    :hover {
      background-color: ${colors.ui.backgroundDefault};
    }
  }
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  && {
    display:flex;
    gap:0.25rem;
    color: ${colors.interactive.primaryResting};
    font-family:EquinorMedium;
  }
`;

export default FilterPanel;
