import { TextField } from "@equinor/eds-core-react";
import formatDateString, {
  validateIsoDateString
} from "components/DateFormatter";
import {
  DateTimeFormat,
  TimeZone,
  UserTheme
} from "contexts/operationStateReducer";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Icon from "styles/Icons";
import { Box } from "@mui/material";
import { useOperationState } from "../../hooks/useOperationState.tsx";

interface DateTimeFieldProps {
  value: string;
  label: string;
  updateObject: (dateTime: string, valid: boolean) => void;
  timeZone: TimeZone;
  disabled?: boolean;
}

/**
 * A component to edit a date time, taking in a string in the DateFormatter.dateTimeFormat.
 * One can either write/paste a string manually, or use the native datepicker.
 * This component should be replaced if EDS ever gets a custom datepicker.
 * @param value The current value of the field.
 * @param label Label shown above the field.
 * @param updateObject A lambda to update the value on the object to be modified.
 * @param timeZone A TimeZone to use in formatting.
 * @param disabled If true, the field is disabled and cannot be edited.
 * @returns
 */
export const DateTimeField = (
  props: DateTimeFieldProps
): React.ReactElement => {
  const { value, label, updateObject, timeZone, disabled } = props;
  const [initiallyEmpty, setInitiallyEmpty] = useState(false);
  const isFirefox = navigator.userAgent.includes("Firefox");
  const {
    operationState: { theme }
  } = useOperationState();
  const isCompact = theme === UserTheme.Compact;

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
  const validate = (current: string) =>
    validateIsoDateString(current) ||
    (initiallyEmpty && (current == null || current === ""));
  const isValid = validate(value);
  return (
    <Layout>
      <TextField
        disabled={disabled}
        id={label}
        label={label}
        value={value ?? ""}
        helperText={getHelperText()}
        variant={validate(value) ? undefined : "error"}
        autoComplete="off"
        onChange={(
          e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        ) => {
          updateObject(e.target.value, validate(e.target.value));
        }}
      />
      {disabled ? null : (
        <>
          <Box
            position="absolute"
            top={`${isCompact ? 16 : 22}px`}
            right={`${isCompact ? 10 : 15}px`}
          >
            <Icon name="calendar" />
          </Box>
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
              if (validateIsoDateString(value)) {
                // preserve the ss.SSSXXX (and also HH:mm for Firefox) part of the original value that the datepicker does not set
                const slice = isFirefox ? value.slice(10) : value.slice(16);
                toFormat += slice;
              }
              const formatted = formatDateString(
                toFormat,
                timeZone,
                DateTimeFormat.Raw
              );
              updateObject(formatted, validate(formatted));
            }}
          />
        </>
      )}
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
