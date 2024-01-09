﻿import {
  Checkbox,
  EdsProvider,
  Icon,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { Divider, Tooltip } from "@material-ui/core";
import { FilterContext, VisibilityStatus } from "contexts/filter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import { ObjectType } from "models/objectType";
import React, { ChangeEvent, useContext } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import {
  STORAGE_FILTER_HIDDENOBJECTS_KEY,
  setLocalStorageItem
} from "tools/localStorageHelpers";

const FilterPanel = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedCurveThreshold } = navigationState;
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  const switchObjectVisibility = (objectType: ObjectType) => {
    const updatedVisibility = { ...selectedFilter.objectVisibilityStatus };
    if (updatedVisibility[objectType] === VisibilityStatus.Visible) {
      updatedVisibility[objectType] = VisibilityStatus.Hidden;
    } else {
      updatedVisibility[objectType] = VisibilityStatus.Visible;
    }
    setLocalStorageItem<ObjectType[]>(
      STORAGE_FILTER_HIDDENOBJECTS_KEY,
      Object.entries(updatedVisibility)
        .filter(([, value]) => value == VisibilityStatus.Hidden)
        .map(([key]) => key as ObjectType)
    );
    updateSelectedFilter({ objectVisibilityStatus: updatedVisibility });
  };

  return (
    <EdsProvider density="compact">
      <Container colors={colors}>
        <NumberInputContainer colors={colors}>
          <span style={{ display: "flex", gap: "7px" }}>
            <Typography
              token={{
                fontFamily: "EquinorMedium",
                fontSize: "0.75rem",
                color: colors.interactive.primaryResting
              }}
            >
              Limit number of wells
            </Typography>
            <Typography
              token={{
                fontStyle: "italic",
                fontFamily: "EquinorRegular",
                fontSize: "0.75rem",
                color: colors.text.staticIconsTertiary
              }}
            >
              (0 for no limit)
            </Typography>
          </span>
          <StyledTextField
            id="filter-wellLimit"
            type="number"
            min={0}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateSelectedFilter({ wellLimit: Number(event.target.value) })
            }
            value={selectedFilter.wellLimit}
            autoComplete={"off"}
            colors={colors}
          />
        </NumberInputContainer>

        <Divider />

        <InnerContainer>
          <StyledCheckbox
            id="filter-isActive"
            value={"Hide inactive Wells / Wellbores"}
            color={"primary"}
            checked={selectedFilter.isActive}
            onChange={(event) =>
              updateSelectedFilter({ isActive: event.target.checked })
            }
            label={"Hide inactive Wells / Wellbores"}
            colors={colors}
          />
          <StyledCheckbox
            onChange={(event) =>
              updateSelectedFilter({ objectGrowing: event.target.checked })
            }
            checked={selectedFilter.objectGrowing}
            id="filter-objectGrowing"
            value={"Only show growing logs"}
            color={"primary"}
            label={"Only show growing logs"}
            colors={colors}
          />
        </InnerContainer>

        <Divider />

        <InnerContainer>
          <NumberInputContainer colors={colors}>
            <span style={{ display: "flex", gap: "7px" }}>
              <Typography
                token={{
                  fontFamily: "EquinorMedium",
                  fontSize: "0.75rem",
                  color: colors.interactive.primaryResting
                }}
              >
                Set threshold for time curve
              </Typography>
              <Typography
                token={{
                  fontStyle: "italic",
                  fontFamily: "EquinorRegular",
                  fontSize: "0.75rem",
                  color: colors.text.staticIconsTertiary
                }}
              >
                {" "}
                (minutes){" "}
              </Typography>
            </span>
            <StyledTextField
              id="curveThreshold-time"
              type="number"
              min={0}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                dispatchNavigation({
                  type: NavigationType.SetCurveThreshold,
                  payload: {
                    curveThreshold: {
                      ...selectedCurveThreshold,
                      timeInMinutes: Number(event.target.value)
                    }
                  }
                })
              }
              value={selectedCurveThreshold.timeInMinutes}
              autoComplete={"off"}
              colors={colors}
            />
          </NumberInputContainer>
          <StyledCheckbox
            id="curveThreshold-hideInactive"
            onChange={(event) =>
              dispatchNavigation({
                type: NavigationType.SetCurveThreshold,
                payload: {
                  curveThreshold: {
                    ...selectedCurveThreshold,
                    hideInactiveCurves: event.target.checked
                  }
                }
              })
            }
            checked={selectedCurveThreshold.hideInactiveCurves}
            value={"Hide inactive time curves"}
            color={"primary"}
            label={"Hide inactive time curves"}
            colors={colors}
          />
        </InnerContainer>

        <Divider />

        <InnerContainer>
          <ObjectTitleContainer>
            <Typography
              token={{
                fontSize: "1rem",
                fontFamily: "EquinorMedium",
                color: colors.interactive.primaryResting
              }}
            >
              Well Objects
            </Typography>
            <Tooltip title="Objects not supported by the current server are disabled.">
              <Icon
                name="infoCircle"
                color={colors.interactive.primaryResting}
                size={18}
              />
            </Tooltip>
          </ObjectTitleContainer>
          <ObjectListContainer>
            {Object.values(ObjectType).map((objectType) => (
              <StyledCheckbox
                label={objectType}
                checked={
                  selectedFilter.objectVisibilityStatus[objectType] ==
                  VisibilityStatus.Visible
                }
                disabled={
                  selectedFilter.objectVisibilityStatus[objectType] ==
                  VisibilityStatus.Disabled
                }
                key={objectType}
                colors={colors}
                onChange={() => switchObjectVisibility(objectType)}
              />
            ))}
          </ObjectListContainer>
        </InnerContainer>
      </Container>
    </EdsProvider>
  );
};

const Container = styled.div<{ colors: Colors }>`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 0.5em;
  user-select: none;
  box-shadow: 1px 4px 5px 0px rgba(0, 0, 0, 0.3);
  background: ${(props) => props.colors.ui.backgroundLight};
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NumberInputContainer = styled.div<{ colors: Colors }>`
  display: grid;
  grid-template-columns: 1fr 80px;
  align-items: baseline;
  padding-left: 0.5em;
  color: ${(props) => props.colors.interactive.primaryResting};
`;

const ObjectListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  overflow-y: scroll;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

const ObjectTitleContainer = styled.div`
  padding-left: 0.8rem;
  display: flex;
  gap: 8px;
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
    background: ${(props) => props.colors.text.staticTextFieldDefault};
  }
`;

export default FilterPanel;
