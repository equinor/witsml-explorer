import { Button, Icon, Label, TextField, Typography } from "@equinor/eds-core-react";
import { isValid, parse } from "date-fns";
import { format } from "date-fns-tz";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import LogObject from "../../models/logObject";
import { Colors, colors, dark } from "../../styles/Colors";
import { WITSML_INDEX_TYPE_DATE_TIME } from "../Constants";
import { formatIndexValue } from "../Modals/SelectIndexToDisplayModal";

interface EditIntervalProps {
  disabled?: boolean;
  overrideStartIndex?: string;
  overrideEndIndex?: string;
}

const EditInterval = (props: EditIntervalProps): React.ReactElement => {
  const { disabled, overrideStartIndex, overrideEndIndex } = props;
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const { selectedObject, selectedLogCurveInfo } = navigationState;
  const selectedLog = selectedObject as LogObject;

  const [startIndex, setStartIndex] = useState<string>(null);
  const [endIndex, setEndIndex] = useState<string>(null);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isValidStart, setIsValidStart] = useState<boolean>(true);
  const [isValidEnd, setIsValidEnd] = useState<boolean>(true);
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  useEffect(() => {
    const minIndex = selectedLogCurveInfo?.[0]?.minIndex;
    const maxIndex = selectedLogCurveInfo?.[0]?.maxIndex;
    setStartIndex(getParsedValue(String(minIndex)));
    setEndIndex(getParsedValue(String(maxIndex)));
  }, []);

  useEffect(() => {
    if (overrideStartIndex) setStartIndex(getParsedValue(overrideStartIndex));
    if (overrideEndIndex) setEndIndex(getParsedValue(overrideEndIndex));
  }, [overrideStartIndex, overrideEndIndex]);

  const submitEditInterval = () => {
    setIsEdited(false);
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

  const parseDate = (current: string) => {
    return parse(current, dateTimeFormat, new Date());
  };

  const isTimeCurve = () => {
    return selectedLog?.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  };

  const getParsedValue = (input: string) => {
    return isTimeCurve() ? (parseDate(input) ? format(new Date(input), dateTimeFormat) : "") : input;
  };

  const onTextFieldChange = (e: any, setIndex: Dispatch<SetStateAction<string>>, setIsValid: Dispatch<SetStateAction<boolean>>) => {
    if (isTimeCurve()) {
      if (isValid(parseDate(e.target.value))) {
        setIndex(e.target.value);
        setIsEdited(true);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      setIndex(e.target.value);
      setIsEdited(true);
    }
  };

  const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss";

  return (
    <EditIntervalLayout colors={colors}>
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
          disabled={disabled}
          id="startIndex"
          value={startIndex}
          // defaultValue={getDefaultValue(startIndex)}
          variant={isValidStart ? undefined : "error"}
          type={isTimeCurve() ? "datetime-local" : ""}
          step="1"
          onChange={(e: any) => {
            onTextFieldChange(e, setStartIndex, setIsValidStart);
          }}
        />
      </StartEndIndex>
      <StartEndIndex>
        <StyledLabel label="End Index" />
        <StyledTextField
          disabled={disabled}
          id="endIndex"
          value={endIndex}
          // defaultValue={getDefaultValue(endIndex)}
          type={isTimeCurve() ? "datetime-local" : ""}
          variant={isValidEnd ? undefined : "error"}
          step="1"
          onChange={(e: any) => {
            onTextFieldChange(e, setEndIndex, setIsValidEnd);
          }}
        />
      </StartEndIndex>
      <StyledButton variant={"ghost"} color={"primary"} onClick={submitEditInterval} disabled={!isValidStart || !isValidEnd}>
        <Icon size={16} name={isEdited ? "arrowForward" : "sync"} />
      </StyledButton>
    </EditIntervalLayout>
  );
};

const EditIntervalLayout = styled.div<{ colors: Colors }>`
  display: flex;
  gap: 0.25rem;
  align-items: center;
  input {
    color-scheme: ${({ colors }) => (colors === dark ? "dark" : "")};
  }
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
  min-width: 220px;
`;

export const StyledButton = styled(Button)`
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
