import { Button, Icon, Label, TextField, Typography } from "@equinor/eds-core-react";
import { useContext, useState } from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { colors } from "../../styles/Colors";
import { formatIndexValue } from "../Modals/SelectIndexToDisplayModal";

const EditInterval = (): React.ReactElement => {
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const { selectedLogCurveInfo } = navigationState;
  const { minIndex, maxIndex } = selectedLogCurveInfo ? selectedLogCurveInfo[0] : { minIndex: null, maxIndex: null };

  const [startIndex, setStartIndex] = useState(String(minIndex));
  const [endIndex, setEndIndex] = useState(String(maxIndex));
  const [isEditInterval, setEditInterval] = useState(false);

  const submitEditInterval = () => {
    const logCurveInfoWithUpdatedIndex = selectedLogCurveInfo.map((logCurveInfo) => {
      return {
        ...logCurveInfo,
        minIndex: formatIndexValue(startIndex),
        maxIndex: formatIndexValue(endIndex)
      };
    });
    dispatchNavigation({
      type: NavigationType.ShowCurveValues,
      payload: { logCurveInfo: logCurveInfoWithUpdatedIndex }
    });
  };
  return (
    <EditIntervalLayout>
      <Typography
        style={{
          color: `${colors.interactive.primaryResting}`
        }}
        variant="h3"
      >
        Curve Values
      </Typography>
      <StartEndIndex>
        <StyledLabel label="Start Index" />
        <StyledTextField
          id="startIndex"
          defaultValue={startIndex}
          onChange={(e: any) => {
            setStartIndex(e.target.value);
            setEditInterval(true);
          }}
        />
      </StartEndIndex>
      <StartEndIndex>
        <StyledLabel label="End Index" />
        <StyledTextField
          id="endIndex"
          defaultValue={endIndex}
          onChange={(e: any) => {
            setEndIndex(e.target.value);
            setEditInterval(true);
          }}
        />
      </StartEndIndex>
      <StyledButton variant={"ghost"} color={isEditInterval ?? "primary"} disabled={!isEditInterval} onClick={submitEditInterval}>
        <Icon size={16} name="arrowForward" />
      </StyledButton>
    </EditIntervalLayout>
  );
};

const EditIntervalLayout = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const StartEndIndex = styled.div`
  display: flex;
`;

const StyledLabel = styled(Label)`
  width: 5rem;
  align-items: center;
  font-style: italic;
`;

const StyledTextField = styled(TextField)`
  div {
    background-color: transparent;
  }
  min-width: 210px;
`;

const StyledButton = styled(Button)`
  ${(props) =>
    props.disabled
      ? `
      &:hover{
        border:2px solid ${colors.interactive.disabledBorder};
        border-radius: 50%;
      }
      &&{
        border:2px solid ${colors.interactive.disabledBorder};
      }`
      : `
      &:hover{
        border-radius: 50%;
      }
      &&{
        border:2px solid ${colors.interactive.primaryResting};
      }`}
  display:flex;
  height: 2rem;
  width: 2rem;
  min-height: 2rem;
  min-width: 2rem;
  padding: 0;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
`;
export default EditInterval;
