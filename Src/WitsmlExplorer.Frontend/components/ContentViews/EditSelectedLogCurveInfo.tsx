import {
  Autocomplete,
  Button,
  EdsProvider,
  Icon,
  Label,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { WITSML_INDEX_TYPE_DATE_TIME } from "components/Constants";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import { isValid, parse } from "date-fns";
import { format } from "date-fns-tz";
import { ComponentType } from "models/componentType";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from "react";
import { truncateAbortHandler } from "services/apiClient";
import ComponentService from "services/componentService";
import styled from "styled-components";
import { Colors, colors, dark } from "styles/Colors";
import { formatIndexValue } from "tools/IndexHelpers";

interface EditSelectedLogCurveInfoProps {
  disabled?: boolean;
  overrideStartIndex?: string;
  overrideEndIndex?: string;
}

const EditSelectedLogCurveInfo = (
  props: EditSelectedLogCurveInfoProps
): React.ReactElement => {
  const { disabled, overrideStartIndex, overrideEndIndex } = props;
  const { operationState } = useContext(OperationContext);
  const { theme } = operationState;
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const { selectedObject, selectedLogCurveInfo } = navigationState;
  const selectedLog = selectedObject as LogObject;
  const [logCurveInfo, setLogCurveInfo] = useState<LogCurveInfo[]>([]);
  const [selectedMnemonics, setSelectedMnemonics] = useState<string[]>([]);
  const [startIndex, setStartIndex] = useState<string>("");
  const [endIndex, setEndIndex] = useState<string>("");
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isValidStart, setIsValidStart] = useState<boolean>(true);
  const [isValidEnd, setIsValidEnd] = useState<boolean>(true);
  const [isFetchingMnemonics, setIsFetchingMnemonics] = useState<boolean>(true);
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  useEffect(() => {
    const minIndex = selectedLogCurveInfo?.[0]?.minIndex;
    const maxIndex = selectedLogCurveInfo?.[0]?.maxIndex;
    const selectedMnemonics = selectedLogCurveInfo
      ?.map((lci) => lci.mnemonic)
      ?.filter((mnemonic) => mnemonic !== selectedLog.indexCurve);
    setSelectedMnemonics(selectedMnemonics || []);
    setStartIndex(getParsedValue(String(minIndex)));
    setEndIndex(getParsedValue(String(maxIndex)));
  }, []);

  useEffect(() => {
    setIsFetchingMnemonics(true);
    if (selectedLog) {
      const controller = new AbortController();

      const getLogCurveInfo = async () => {
        const logCurveInfo = await ComponentService.getComponents(
          selectedLog.wellUid,
          selectedLog.wellboreUid,
          selectedLog.uid,
          ComponentType.Mnemonic,
          undefined,
          controller.signal
        );
        setLogCurveInfo(logCurveInfo.slice(1)); // Skip the first one as it is the index curve
        setIsFetchingMnemonics(false);
      };

      getLogCurveInfo().catch(truncateAbortHandler);

      return () => {
        controller.abort();
      };
    }
  }, [selectedLog]);

  useEffect(() => {
    if (overrideStartIndex) setStartIndex(getParsedValue(overrideStartIndex));
    if (overrideEndIndex) setEndIndex(getParsedValue(overrideEndIndex));
  }, [overrideStartIndex, overrideEndIndex]);

  const submitLogCurveInfo = () => {
    setIsEdited(false);
    const filteredLogCurveInfo = logCurveInfo.filter((lci) =>
      selectedMnemonics.includes(lci.mnemonic)
    );
    const logCurveInfoWithUpdatedIndex = filteredLogCurveInfo.map(
      (logCurveInfo) => {
        return {
          ...logCurveInfo,
          minIndex: formatIndexValue(startIndex),
          maxIndex: formatIndexValue(endIndex)
        };
      }
    );
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
    return isTimeCurve()
      ? parseDate(input)
        ? format(new Date(input), dateTimeFormat)
        : ""
      : input;
  };

  const onTextFieldChange = (
    e: any,
    setIndex: Dispatch<SetStateAction<string>>,
    setIsValid: Dispatch<SetStateAction<boolean>>
  ) => {
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

  const onMnemonicsChange = ({
    selectedItems
  }: {
    selectedItems: string[];
  }) => {
    setSelectedMnemonics(selectedItems);
    setIsEdited(true);
  };

  const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss";

  return (
    <EdsProvider density={theme}>
      <Layout colors={colors}>
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
            type={isTimeCurve() ? "datetime-local" : ""}
            variant={isValidEnd ? undefined : "error"}
            step="1"
            onChange={(e: any) => {
              onTextFieldChange(e, setEndIndex, setIsValidEnd);
            }}
          />
        </StartEndIndex>
        <StartEndIndex>
          <StyledLabel label="Mnemonics" />
          <Autocomplete
            id={"mnemonics"}
            disabled={disabled || isFetchingMnemonics}
            label={""}
            multiple={true}
            // @ts-ignore. Variant is defined and exists in the documentation, but not in the type definition.
            variant={selectedMnemonics.length === 0 ? "error" : null}
            options={logCurveInfo.map((lci) => lci.mnemonic)}
            selectedOptions={selectedMnemonics}
            onFocus={(e) => e.preventDefault()}
            onOptionsChange={onMnemonicsChange}
            style={
              {
                "--eds-input-background": colors.ui.backgroundDefault
              } as CSSProperties
            }
            dropdownHeight={600}
          />
        </StartEndIndex>
        <StyledButton
          variant={"ghost"}
          color={"primary"}
          onClick={submitLogCurveInfo}
          disabled={
            disabled ||
            !isValidStart ||
            !isValidEnd ||
            selectedMnemonics.length === 0
          }
        >
          <Icon size={16} name={isEdited ? "arrowForward" : "sync"} />
        </StyledButton>
      </Layout>
    </EdsProvider>
  );
};

const Layout = styled.div<{ colors: Colors }>`
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
  white-space: nowrap;
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
export default EditSelectedLogCurveInfo;
