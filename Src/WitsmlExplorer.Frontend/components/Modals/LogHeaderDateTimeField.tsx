import { TextField } from "@equinor/eds-core-react";
import formatDateString, {
  dateTimeFormatTextField,
  getOffset,
  getOffsetFromTimeZone
} from "components/DateFormatter";
import OperationContext from "contexts/operationContext";
import { DateTimeFormat, TimeZone } from "contexts/operationStateReducer";
import { isValid, parse } from "date-fns";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import styled from "styled-components";

interface DateTimeFieldProps {
  value: string;
  label: string;
  updateObject: (dateTime: string) => void;
  minValue?: string;
  maxValue?: string;
}

/**
 * A component to edit a date time, taking in a string in the DateFormatter.dateTimeFormat.
 * The offset is shown beside the input in a disabled field.
 * One can either write/paste a string manually, or use the native datepicker.
 * @param value The current value of the field.
 * @param label Label shown above the field.
 * @param updateObject A lambda to update the value on the object to be modified.
 * @param minValue Optional earliest time the value can be.
 * @param maxValue Optional latest time the value can be.
 * @returns
 */
export const LogHeaderDateTimeField = (
  props: DateTimeFieldProps
): React.ReactElement => {
  const { value, label, updateObject, minValue, maxValue } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const offset =
    timeZone === TimeZone.Raw
      ? getOffset(value)
      : getOffsetFromTimeZone(timeZone);
  const [initiallyEmpty, setInitiallyEmpty] = useState(false);

  useEffect(() => {
    setInitiallyEmpty(value == null || value === "");
  }, []);

  const validate = (current: string) => {
    return (
      ((!minValue || current >= minValue) &&
        (!maxValue || current <= maxValue)) ||
      (initiallyEmpty && (current == null || current === ""))
    );
  };

  const getHelperText = () => {
    if (!validate(value)) {
      if (!initiallyEmpty && (value == null || value === "")) {
        return "This field cannot be deleted.";
      }
      if (minValue && value < minValue) {
        return `Must be later than ${minValue}`;
      }
      if (maxValue && value > maxValue) {
        return `Must be sooner than ${maxValue}`;
      }
      return "The input must be in the yyyy-MM-dd'T'HH:mm:ss format.";
    }
    return "";
  };

  const onTextFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isMissingSeconds = e.target.value.split(":")?.length === 2;
    const value = isMissingSeconds ? `${e.target.value}:00` : e.target.value;
    if (isValid(parseDate(value))) {
      updateObject(getUtcValue(value, offset));
    }
  };

  return (
    <Layout>
      <Horizontal>
        <TextField
          id={"offset"}
          label={"UTC offset"}
          value={offset}
          disabled
          style={{
            fontFeatureSettings: '"tnum"',
            width: "92px"
          }}
        />
        <TextField
          id={label}
          value={getParsedValue(value, timeZone) ?? ""}
          helperText={getHelperText()}
          variant={validate(value) ? undefined : "error"}
          type={"datetime-local"}
          step="1"
          onChange={onTextFieldChange}
          style={{
            paddingTop: "16px",
            fontFeatureSettings: '"tnum"'
          }}
        />
      </Horizontal>
    </Layout>
  );
};

const parseDate = (current: string) => {
  return parse(current, dateTimeFormatTextField, new Date());
};

const getParsedValue = (input: string, timeZone: TimeZone) => {
  if (!input) return null;
  return formatDateString(input, timeZone, DateTimeFormat.RawNoOffset);
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

const Layout = styled.div`
  position: relative;
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

const Horizontal = styled.div`
  display: flex;
  flex-direction: row;
`;
