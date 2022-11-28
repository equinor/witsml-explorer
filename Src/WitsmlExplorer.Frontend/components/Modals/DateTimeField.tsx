import { TextField } from "@equinor/eds-core-react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { TimeZone } from "../../contexts/operationStateReducer";
import Icon from "../../styles/Icons";
import formatDateString, { validateIsoDateString } from "../DateFormatter";

interface DateTimeFieldProps {
  value: string;
  label: string;
  updateObject: (dateTime: string) => void;
  timeZone: TimeZone;
}

/**
 * A component to edit a date time, taking in a string in the DateFormatter.dateTimeFormat.
 * One can either write/paste a string manually, or use the native datepicker.
 * This component should be replaced if EDS ever gets a custom datepicker.
 * @param value The current value of the field.
 * @param label Label shown above the field.
 * @param updateObject A lambda to update the value on the object to be modified.
 * @param timeZone A TimeZone to use in formatting.
 * @returns
 */
export const DateTimeField = (props: DateTimeFieldProps): React.ReactElement => {
  const { value, label, updateObject, timeZone } = props;
  const [initiallyEmpty, setInitiallyEmpty] = useState(false);

  useEffect(() => {
    setInitiallyEmpty(value == null || value === "");
  }, []);

  const getHelperText = () => {
    if (!isValid) {
      if (!initiallyEmpty && (value == null || value === "")) {
        return "This field cannot be deleted.";
      }
      return "The input must be in the yyyy-MM-dd'T'HH:mm:ss.SSS±ZZ:ZZ format.";
    }
    return "";
  };

  const isValid = validateIsoDateString(value) || (initiallyEmpty && (value == null || value === ""));
  return (
    <Layout>
      <TextField
        id={label}
        label={label}
        value={value}
        helperText={getHelperText()}
        variant={isValid ? undefined : "error"}
        autoComplete="off"
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
          updateObject(e.target.value);
        }}
      />
      <PickerIcon name="calendar" />
      <Picker
        id={label + "picker"}
        placeholder=""
        label=""
        type="datetime-local"
        style={{ width: "44px" }}
        tabIndex={-1} //disable tab focus due to the native datepicker including multiple invisible fields that are not to be used
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
          // preserve the :mm:ss.SSSXXX part of the original value that the datepicker does not set
          const slice = value.slice(16);
          const toFormat = e.target.value + slice;
          const formatted = formatDateString(toFormat, timeZone);
          updateObject(formatted);
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
