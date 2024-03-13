import {
  Autocomplete,
  Button,
  EdsProvider,
  Icon,
  Label,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { isValid, parse } from "date-fns";
import { format } from "date-fns-tz";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetMnemonics } from "hooks/useGetMnemonics";
import { ComponentType } from "models/componentType";
import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useContext,
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

interface EditSelectedLogCurveInfoProps {
  disabled?: boolean;
  overrideStartIndex?: string;
  overrideEndIndex?: string;
  onClickRefresh?: () => void;
}

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss";

const EditSelectedLogCurveInfo = (
  props: EditSelectedLogCurveInfoProps
): React.ReactElement => {
  const { disabled, overrideStartIndex, overrideEndIndex, onClickRefresh } =
    props;
  const { operationState } = useContext(OperationContext);
  const { theme, colors } = operationState;
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
  const [selectedStartIndex, setSelectedStartIndex] = useState<string>(
    getParsedValue(startIndex, isTimeLog)
  );
  const [selectedEndIndex, setSelectedEndIndex] = useState<string>(
    getParsedValue(endIndex, isTimeLog)
  );
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isValidStart, setIsValidStart] = useState<boolean>(true);
  const [isValidEnd, setIsValidEnd] = useState<boolean>(true);

  const { mnemonics: selectedMnemonics, setMnemonics: setSelectedMnemonics } =
    useGetMnemonics(isFetching, logCurveInfo, mnemonicsSearchParams);

  useEffect(() => {
    setSelectedStartIndex(getParsedValue(startIndex, isTimeLog));
    setSelectedEndIndex(getParsedValue(endIndex, isTimeLog));
  }, [startIndex, endIndex]);

  useEffect(() => {
    if (overrideStartIndex)
      setSelectedStartIndex(getParsedValue(overrideStartIndex, isTimeLog));
    if (overrideEndIndex)
      setSelectedEndIndex(getParsedValue(overrideEndIndex, isTimeLog));
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
    e: any,
    setIndex: Dispatch<SetStateAction<string>>,
    setIsValid: Dispatch<SetStateAction<boolean>>
  ) => {
    if (isTimeLog) {
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

  return (
    selectedMnemonics && (
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
              value={selectedStartIndex ?? ""}
              variant={isValidStart ? undefined : "error"}
              type={isTimeLog ? "datetime-local" : ""}
              step="1"
              onChange={(e: any) => {
                onTextFieldChange(e, setSelectedStartIndex, setIsValidStart);
              }}
            />
          </StartEndIndex>
          <StartEndIndex>
            <StyledLabel label="End Index" />
            <StyledTextField
              disabled={disabled}
              id="endIndex"
              value={selectedEndIndex ?? ""}
              type={isTimeLog ? "datetime-local" : ""}
              variant={isValidEnd ? undefined : "error"}
              step="1"
              onChange={(e: any) => {
                onTextFieldChange(e, setSelectedEndIndex, setIsValidEnd);
              }}
            />
          </StartEndIndex>
          <StartEndIndex>
            <StyledLabel label="Mnemonics" />
            <Autocomplete
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

const parseDate = (current: string) => {
  return parse(current, dateTimeFormat, new Date());
};

const getParsedValue = (input: string, isTimeLog: boolean) => {
  if (!input) return null;
  return isTimeLog
    ? parseDate(input)
      ? format(new Date(input), dateTimeFormat)
      : ""
    : input;
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

export default EditSelectedLogCurveInfo;
