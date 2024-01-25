import { TextField } from "@equinor/eds-core-react";
import {
  dateTimeFormatNoOffset,
  validateIsoDateStringNoOffset
} from "components/DateFormatter";
import { formatInTimeZone } from "date-fns-tz";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Icon from "styles/Icons";

interface DateTimeFieldProps {
  value: string;
  label: string;
  updateObject: (dateTime: string, valid: boolean) => void;
  offset: string;
  minValue?: string;
  maxValue?: string;
}

/**
 * A component to edit a date time, taking in a string in the DateFormatter.dateTimeFormatNoOffset.
 * The offset is shown beside the input in a disabled field.
 * One can either write/paste a string manually, or use the native datepicker.
 * This component should be replaced if EDS ever gets a custom datepicker.
 * @param value The current value of the field.
 * @param label Label shown above the field.
 * @param updateObject A lambda to update the value on the object to be modified.
 * @param offset A constant UTC offset to calculate the time properly
 * @param minValue Optional earliest time the value can be.
 * @param maxValue Optional latest time the value can be.
 * @returns
 */
export const LogHeaderDateTimeField = (
  props: DateTimeFieldProps
): React.ReactElement => {
  const { value, label, updateObject, offset, minValue, maxValue } = props;
  const [initiallyEmpty, setInitiallyEmpty] = useState(false);
  const isFirefox = navigator.userAgent.includes("Firefox");

  useEffect(() => {
    setInitiallyEmpty(value == null || value === "");
  }, []);

  const validate = (current: string) => {
    return (
      (validateIsoDateStringNoOffset(current, offset) &&
        (!minValue || current >= minValue) &&
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
      return "The input must be in the yyyy-MM-dd'T'HH:mm:ss.SSS format.";
    }
    return "";
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
            width: "16%"
          }}
        />
        <TextField
          id={label}
          label={label}
          value={value}
          helperText={getHelperText()}
          variant={validate(value) ? undefined : "error"}
          autoComplete="off"
          onChange={(
            e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
          ) => {
            updateObject(e.target.value, validate(e.target.value));
          }}
          style={{
            fontFeatureSettings: '"tnum"',
            paddingBottom: validate(value) ? "24px" : 0
          }}
        />
      </Horizontal>
      <PickerIcon name="calendar" />
      <Picker
        id={label + "picker"}
        placeholder=""
        label=""
        value=""
        type={isFirefox ? "date" : "datetime-local"}
        style={{ width: "44px" }}
        tabIndex={-1} //disable tab focus due to the native datepicker including multiple invisible fields that are not to be used
        onChange={(
          e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        ) => {
          let toFormat = e.target.value;
          if (validateIsoDateStringNoOffset(value, offset)) {
            // preserve the ss.SSS (and also HH:mm for Firefox) part of the original value that the datepicker does not set
            const slice = isFirefox ? value.slice(10) : value.slice(16);
            toFormat += slice;
          }
          toFormat += offset;
          const formatted = formatInTimeZone(
            toFormat,
            offset,
            dateTimeFormatNoOffset
          );
          updateObject(formatted, validate(formatted));
        }}
      />
    </Layout>
  );
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

const Picker = styled(TextField)`
  opacity: 0;
  position: absolute;
  right: 0;
  top: 15px;
`;

const PickerIcon = styled(Icon)`
  position: absolute;
  right: 15px;
  top: 22px;
`;
