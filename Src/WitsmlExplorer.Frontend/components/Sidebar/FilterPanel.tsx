import {
  EdsProvider,
  Icon,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { Divider, Tooltip } from "@mui/material";
import { Checkbox } from "components/StyledComponents/Checkbox";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useCurveThreshold } from "contexts/curveThresholdContext";
import { FilterContext, VisibilityStatus } from "contexts/filter";
import { useGetCapObjects } from "hooks/query/useGetCapObjects";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import React, { ChangeEvent, useContext } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import {
  setLocalStorageItem,
  STORAGE_FILTER_HIDDENOBJECTS_KEY,
  STORAGE_FILTER_INACTIVE_TIME_CURVES_KEY,
  STORAGE_FILTER_INACTIVE_TIME_CURVES_VALUE_KEY,
  STORAGE_FILTER_ISACTIVE_KEY,
  STORAGE_FILTER_OBJECTGROWING_KEY,
  STORAGE_FILTER_PRIORITYSERVERS_KEY,
  STORAGE_FILTER_UIDMAPPING_KEY
} from "tools/localStorageHelpers";

const FilterPanel = (): React.ReactElement => {
  const { curveThreshold, setCurveThreshold } = useCurveThreshold();
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const {
    operationState: { colors }
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const { capObjects } = useGetCapObjects(connectedServer, {
    placeholderData: Object.entries(ObjectType)
  });

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

  const onChangeIsActive = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalStorageItem<boolean>(STORAGE_FILTER_ISACTIVE_KEY, e.target.checked);
    updateSelectedFilter({ isActive: e.target.checked });
  };

  const onChangePriorityServers = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalStorageItem<boolean>(
      STORAGE_FILTER_PRIORITYSERVERS_KEY,
      e.target.checked
    );
    updateSelectedFilter({ filterPriorityServers: e.target.checked });
  };

  const onChangeObjectGrowing = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalStorageItem<boolean>(
      STORAGE_FILTER_OBJECTGROWING_KEY,
      e.target.checked
    );
    updateSelectedFilter({ objectGrowing: e.target.checked });
  };

  const onChangeUidMapping = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalStorageItem<boolean>(
      STORAGE_FILTER_UIDMAPPING_KEY,
      e.target.checked
    );
    updateSelectedFilter({ uidMapping: e.target.checked });
  };

  const onChangeHideInactiveTimeCurves = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalStorageItem<boolean>(
      STORAGE_FILTER_INACTIVE_TIME_CURVES_KEY,
      e.target.checked
    );
    setCurveThreshold({
      ...curveThreshold,
      hideInactiveCurves: e.target.checked
    });
  };

  const onChangeInactiveTimeCurvesValue = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setLocalStorageItem<number>(
      STORAGE_FILTER_INACTIVE_TIME_CURVES_VALUE_KEY,
      Number(e.target.value)
    );
    setCurveThreshold({
      ...curveThreshold,
      timeInMinutes: Number(e.target.value)
    });
  };

  return (
    <EdsProvider density="compact">
      <Container colors={colors}>
        <InnerContainer>
          <Checkbox
            id="filter-serverPriority"
            value={"Only show priority servers"}
            color={"primary"}
            checked={selectedFilter.filterPriorityServers}
            onChange={onChangePriorityServers}
            label={"Only show priority servers"}
            colors={colors}
          />
          <Checkbox
            id="filter-isActive"
            value={"Hide inactive Wells / Wellbores"}
            color={"primary"}
            checked={selectedFilter.isActive}
            onChange={onChangeIsActive}
            label={"Hide inactive Wells / Wellbores"}
            colors={colors}
          />
          <Checkbox
            onChange={onChangeObjectGrowing}
            checked={selectedFilter.objectGrowing}
            id="filter-objectGrowing"
            value={"Only show growing logs"}
            color={"primary"}
            label={"Only show growing logs"}
            colors={colors}
          />
          <Checkbox
            onChange={onChangeUidMapping}
            checked={selectedFilter.uidMapping}
            id="filter-uidMapping"
            value={"Only show mapped wellbores"}
            color={"primary"}
            label={"Only show mapped wellbores"}
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
              onChange={onChangeInactiveTimeCurvesValue}
              value={curveThreshold.timeInMinutes}
              autoComplete={"off"}
              colors={colors}
            />
          </NumberInputContainer>
          <Checkbox
            id="curveThreshold-hideInactive"
            onChange={onChangeHideInactiveTimeCurves}
            checked={curveThreshold.hideInactiveCurves}
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
              <Checkbox
                label={objectType}
                checked={
                  selectedFilter.objectVisibilityStatus[objectType] ===
                    VisibilityStatus.Visible && capObjects.includes(objectType)
                }
                disabled={!capObjects.includes(objectType)}
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

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }

  div {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
  }
`;

export default FilterPanel;
