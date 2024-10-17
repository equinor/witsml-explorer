import {
  Autocomplete,
  EdsProvider,
  Icon,
  Label,
  TextField
} from "@equinor/eds-core-react";
import formatDateString, {
  getOffset,
  getOffsetFromTimeZone
} from "components/DateFormatter";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import { DateTimeFormat, TimeZone } from "contexts/operationStateReducer";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetMnemonics } from "hooks/useGetMnemonics";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import {
  CSSProperties,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import { checkIsUrlTooLong } from "routes/utils/checkIsUrlTooLong";
import styled from "styled-components";
import { Colors, dark } from "styles/Colors";
import { createLogCurveValuesSearchParams } from "../../routes/utils/createLogCurveValuesSearchParams";
import { normaliseThemeForEds } from "../../tools/themeHelpers.ts";

interface EditSelectedLogCurveInfoProps {
  disabled?: boolean;
  overrideStartIndex?: string;
  overrideEndIndex?: string;
  onClickRefresh?: () => void;
}

const EditSelectedLogCurveInfo = (
  props: EditSelectedLogCurveInfoProps
): React.ReactElement => {
  const { disabled, overrideStartIndex, overrideEndIndex, onClickRefresh } =
    props;
  const { operationState } = useOperationState();
  const { theme, colors, timeZone } = operationState;
  const { wellUid, wellboreUid, logType, objectUid } = useParams();
  const isTimeLog = logType === RouterLogType.TIME;
  const { connectedServer } = useConnectedServer();
  const { components: logCurveInfo, isFetching } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.Mnemonic
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mnemonicsSearchParams = searchParams.get("mnemonics");
  const startIndex = searchParams.get("startIndex");
  const endIndex = searchParams.get("endIndex");
  const [selectedStartIndex, setSelectedStartIndex] =
    useState<string>(startIndex);
  const [selectedEndIndex, setSelectedEndIndex] = useState<string>(endIndex);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isValidStart, setIsValidStart] = useState<boolean>(true);
  const [isValidEnd, setIsValidEnd] = useState<boolean>(true);

  const { mnemonics: selectedMnemonics, setMnemonics: setSelectedMnemonics } =
    useGetMnemonics(isFetching, logCurveInfo, mnemonicsSearchParams);

  useEffect(() => {
    setSelectedStartIndex(startIndex);
    setSelectedEndIndex(endIndex);
  }, [startIndex, endIndex]);

  useEffect(() => {
    if (overrideStartIndex) setSelectedStartIndex(overrideStartIndex);
    if (overrideEndIndex) setSelectedEndIndex(overrideEndIndex);
  }, [overrideStartIndex, overrideEndIndex]);

  const submitLogCurveInfo = () => {
    if (isEdited) {
      const newSearchParams = createLogCurveValuesSearchParams(
        selectedStartIndex,
        selectedEndIndex,
        selectedMnemonics
      );
      const isUrlTooLong = checkIsUrlTooLong(
        location.pathname,
        newSearchParams
      );
      navigate(
        {
          pathname: location.pathname,
          search: isUrlTooLong
            ? createLogCurveValuesSearchParams(
                selectedStartIndex,
                selectedEndIndex
              ).toString()
            : newSearchParams.toString()
        },
        {
          state: {
            mnemonics: JSON.stringify(selectedMnemonics)
          }
        }
      );
    } else {
      onClickRefresh?.();
    }
    setIsEdited(false);
  };

  const onTextFieldChange = (
    e: ChangeEvent<HTMLInputElement>,
    setIndex: Dispatch<SetStateAction<string>>,
    setIsValid: Dispatch<SetStateAction<boolean>>,
    index: string
  ) => {
    if (isTimeLog) {
      const isMissingSeconds = e.target.value.split(":")?.length === 2;
      const value = isMissingSeconds ? `${e.target.value}:00` : e.target.value;
      const offset =
        timeZone === TimeZone.Raw
          ? getOffset(index)
          : getOffsetFromTimeZone(timeZone);
      if (getUtcValue(value, offset) !== "Invalid date") {
        setIndex(getUtcValue(value, offset));
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

  return (
    selectedMnemonics && (
      <EdsProvider density={normaliseThemeForEds(theme)}>
        <Layout colors={colors}>
          <StartEndIndex>
            <StyledLabel label="Start Index:" colors={colors} />
            <StyledTextField
              disabled={disabled}
              id="startIndex"
              value={
                getParsedValue(selectedStartIndex, isTimeLog, timeZone) ?? ""
              }
              variant={isValidStart ? undefined : "error"}
              type={isTimeLog ? "datetime-local" : ""}
              step="0.001"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onTextFieldChange(
                  e,
                  setSelectedStartIndex,
                  setIsValidStart,
                  startIndex
                );
              }}
            />
          </StartEndIndex>
          <StartEndIndex>
            <StyledLabel label="End Index:" colors={colors} />
            <StyledTextField
              disabled={disabled}
              id="endIndex"
              value={
                getParsedValue(selectedEndIndex, isTimeLog, timeZone) ?? ""
              }
              type={isTimeLog ? "datetime-local" : ""}
              variant={isValidEnd ? undefined : "error"}
              step="0.001"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onTextFieldChange(
                  e,
                  setSelectedEndIndex,
                  setIsValidEnd,
                  endIndex
                );
              }}
            />
          </StartEndIndex>
          <StartEndIndex>
            <StyledLabel label="Mnemonics:" colors={colors} />
            <StyledAutocomplete
              id={"mnemonics"}
              disabled={disabled || isFetching}
              label={""}
              multiple={true}
              // @ts-ignore. Variant is defined and exists in the documentation, but not in the type definition.
              variant={selectedMnemonics.length === 0 ? "error" : null}
              options={logCurveInfo?.slice(1)?.map((lci) => lci.mnemonic)} // Skip the first one as it is the index curve
              selectedOptions={selectedMnemonics}
              onFocus={(e) => e.preventDefault()}
              onOptionsChange={onMnemonicsChange}
              style={
                {
                  "--eds-input-background": colors.ui.backgroundDefault
                } as CSSProperties
              }
              dropdownHeight={600}
              colors={colors}
            />
          </StartEndIndex>
          <Button
            variant={"ghost_icon"}
            onClick={submitLogCurveInfo}
            disabled={
              disabled ||
              isFetching ||
              !isValidStart ||
              !isValidEnd ||
              selectedMnemonics.length === 0
            }
          >
            <Icon name={isEdited ? "arrowForward" : "sync"} />
          </Button>
        </Layout>
      </EdsProvider>
    )
  );
};

const getParsedValue = (
  input: string,
  isTimeLog: boolean,
  timeZone: TimeZone
) => {
  if (!input) return null;
  return isTimeLog
    ? formatDateString(input, timeZone, DateTimeFormat.RawNoOffset)
    : input;
};

const getUtcValue = (input: string, offset: string) => {
  if (!input) return null;
  const inputWithZone = input + offset;
  const utcInput = formatDateString(
    inputWithZone,
    TimeZone.Utc,
    DateTimeFormat.Raw
  );
  return utcInput;
};

const StyledAutocomplete = styled(Autocomplete)<{ colors: Colors }>`
  button {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
`;

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

const StyledLabel = styled(Label)<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
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

export default EditSelectedLogCurveInfo;
