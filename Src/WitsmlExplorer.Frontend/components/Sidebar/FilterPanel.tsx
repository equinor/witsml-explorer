import { Checkbox, TextField, Typography } from "@equinor/eds-core-react";
import { Divider } from "@material-ui/core";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import React, { ChangeEvent, useContext, useState } from "react";
import styled from "styled-components";
import { FilterContext } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import { WellboreObjects } from "../../contexts/wellboreObjects";
import { Colors } from "../../styles/Colors";

const FilterPanel = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedCurveThreshold } = navigationState;
  const { selectedFilter, updateSelectedFilter } = React.useContext(FilterContext);
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  const [showMore, setShowmore] = useState<boolean>(false);
  const ListWellborObj = {
    display: "grid",
    gridTemplateColumns: "repeat(2, auto)",
    gap: "1.2rem",
    height: "calc(100vh - 388px)",
    overflowY: "scroll",
    paddingTop: "1rem"
  } as CSSProperties;

  const WellboreObject = {
    display: "grid",
    gridTemplateColumns: "1fr 80px",
    alignItems: "baseline",
    userSelect: "none",
    color: "{colors.interactive.primaryResting}",
    paddingLeft: "0.8rem",
    paddingRight: "0.5rem",
    paddingBottom: "0.5rem"
  } as CSSProperties;

  const defaultCheckedValues = [
    "Well",
    "Wellbore",
    "bhaRun",
    "changeLog",
    "fluidsReport",
    "formationMarker",
    "log",
    "message",
    "mudLog",
    "risk",
    "trajectory",
    "tubular",
    "wbGeometry"
  ];
  const wellObjectList = Object.values(WellboreObjects).map((wellObj: string) => {
    return (
      <StyledCheckbox
        label={wellObj}
        disabled={true} //disabling everything for now as checking objects does not do anything yet, should use DisabledWellObj when implemented
        style={{ height: "0.75rem" }}
        defaultChecked={defaultCheckedValues.includes(wellObj)}
        key={wellObj}
        colors={colors}
      />
    );
  });

  return (
    <Container style={{ boxShadow: !showMore ? "1px 4px 5px 0px #8888" : "none", background: colors.ui.backgroundLight }}>
      {
        <>
          <div style={WellboreObject}>
            <span style={{ display: "flex", gap: "7px" }}>
              <Typography token={{ fontFamily: "EquinorMedium", fontSize: "0.875rem", color: colors.interactive.primaryResting }}>Limit number of wells</Typography>
              <Typography token={{ fontStyle: "italic", fontFamily: "EquinorRegular", fontSize: "0.75rem", color: colors.text.staticIconsTertiary }}>(0 for no limit)</Typography>
            </span>

            <StyledTextField
              id="filter-wellLimit"
              type="number"
              min={0}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateSelectedFilter({ wellLimit: Number(event.target.value) })}
              value={selectedFilter.wellLimit}
              autoComplete={"off"}
              colors={colors}
            />
          </div>
          <Divider />
          <div style={{ paddingTop: "0.75rem", color: "pink !important" }}>
            <StyledCheckbox
              id="filter-isActive"
              value={"Show active Wells / Wellbores"}
              color={"primary"}
              checked={selectedFilter.isActive}
              onChange={(event) => updateSelectedFilter({ isActive: event.target.checked })}
              style={{ height: "0.625rem", userSelect: "none", color: "pink !important" }}
              label={"Show active Wells / Wellbores"}
              colors={colors}
            />
          </div>
          <div style={{ userSelect: "none" }}>
            <StyledCheckbox
              onChange={(event) => updateSelectedFilter({ objectGrowing: event.target.checked })}
              checked={selectedFilter.objectGrowing}
              id="filter-objectGrowing"
              value={"Show growing logs"}
              color={"primary"}
              label={"Show growing logs"}
              style={{ userSelect: "none" }}
              colors={colors}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px",
              alignItems: "center",
              paddingBottom: "10px",
              paddingLeft: "0.8rem",
              paddingRight: "0.5rem",
              userSelect: "none"
            }}
          >
            <span style={{ display: "flex", gap: "0.5rem" }}>
              <Typography token={{ fontSize: "0.75rem", fontFamily: "EquinorMedium", color: colors.text.staticIconsTertiary }} style={{ display: "flex", gap: "7px" }}>
                Set threshold for time curve
              </Typography>
              <Typography token={{ fontStyle: "italic", fontFamily: "EquinorRegular", fontSize: "0.75rem", color: colors.text.staticIconsTertiary }}> (minutes) </Typography>
            </span>

            <StyledTextField
              style={{ background: "transparent" }}
              id="curveThreshold-time"
              type="number"
              min={0}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                dispatchNavigation({
                  type: NavigationType.SetCurveThreshold,
                  payload: { curveThreshold: { ...selectedCurveThreshold, timeInMinutes: Number(event.target.value) } }
                })
              }
              value={selectedCurveThreshold.timeInMinutes}
              autoComplete={"off"}
              colors={colors}
            />
          </div>

          <div style={{ userSelect: "none" }}>
            <StyledCheckbox
              id="curveThreshold-hideInactive"
              onChange={(event) =>
                dispatchNavigation({ type: NavigationType.SetCurveThreshold, payload: { curveThreshold: { ...selectedCurveThreshold, hideInactiveCurves: event.target.checked } } })
              }
              checked={selectedCurveThreshold.hideInactiveCurves}
              value={"Hide inactive time curves"}
              color={"primary"}
              style={{ height: "10px" }}
              label={"Hide inactive time curves"}
              colors={colors}
            />
          </div>
        </>
      }

      {
        <Typography
          token={{ fontSize: " 0.85rem", fontStyle: "italic", fontFamily: "EquinorMedium", color: colors.interactive.primaryResting }}
          style={{ padding: "0.5rem 0 0 0.8rem", userSelect: "none", cursor: "pointer" }}
          onClick={() => {
            setShowmore(!showMore);
          }}
        >
          {showMore ? " Hide more settings" : "Show more settings"}
        </Typography>
      }
      {showMore ? (
        <React.Fragment>
          <Typography style={{ paddingLeft: "0.8rem", paddingTop: "1em" }} token={{ fontSize: "1rem", fontFamily: "EquinorMedium", color: colors.interactive.primaryResting }}>
            Well Objects
          </Typography>
          <span style={ListWellborObj}> {wellObjectList} </span>
        </React.Fragment>
      ) : (
        ""
      )}
    </Container>
  );
};

const Container = styled.div`
  padding-bottom: 0.5em;
`;

const StyledCheckbox = styled(Checkbox)<{ colors: Colors }>`
  span {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  span:hover {
    background: ${(props) => props.colors.interactive.checkBoxHover};
  }
`;

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }
  div {
    background: ${(props) => props.colors.text.staticTextFeildDefault};
  }
`;

export default FilterPanel;
