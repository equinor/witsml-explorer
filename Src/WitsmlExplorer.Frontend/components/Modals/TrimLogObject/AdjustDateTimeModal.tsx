import React, { useEffect, useState } from "react";
import moment, { Moment } from "moment";
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import { DateFormat } from "../../Constants";

export interface AdjustDateTimeModelProps {
  minDate: Moment;
  maxDate: Moment;
  onStartDateChanged: (value: Moment) => void;
  onEndDateChanged: (value: Moment) => void;
  onValidChange: (isValid: boolean) => void;
}

const AdjustDateTimeModal = (props: AdjustDateTimeModelProps): React.ReactElement => {
  const { minDate, maxDate, onStartDateChanged, onEndDateChanged, onValidChange } = props;
  const [startIndex, setStartIndex] = useState<Moment>(minDate);
  const [endIndex, setEndIndex] = useState<Moment>(maxDate);
  const [startIndexIsValid, setStartIndexIsValid] = useState<boolean>();
  const [endIndexIsValid, setEndIndexIsValid] = useState<boolean>();

  useEffect(() => {
    onStartDateChanged(startIndex);
    onEndDateChanged(endIndex);
  }, []);

  useEffect(() => {
    if (startIndex && endIndex) {
      setStartIndexIsValid(startIndex.milliseconds(0) < endIndex.milliseconds(0));
      setEndIndexIsValid(endIndex.milliseconds(0) > startIndex.milliseconds(0));
    }
  }, [startIndex, endIndex]);

  useEffect(() => {
    onValidChange(startIndexIsValid && endIndexIsValid);
  }, [startIndexIsValid, endIndexIsValid]);

  const handleStartIndexChanged = (value: Moment) => {
    setStartIndex(value);
    onStartDateChanged(value);
  };

  const handleEndIndexChanged = (value: Moment) => {
    setEndIndex(value);
    onEndDateChanged(value);
  };

  return (
    <>
      <KeyboardDateTimePicker
        fullWidth
        disableToolbar
        variant={"inline"}
        format={DateFormat.DATETIME_S}
        margin={"normal"}
        label={"Start index"}
        value={startIndex}
        ampm={false}
        error={!startIndexIsValid}
        helperText={startIndexIsValid ? "" : `Must be lower than ${moment(endIndex).format(DateFormat.DATETIME_S)}`}
        onChange={handleStartIndexChanged}
      />
      <KeyboardDateTimePicker
        fullWidth
        disableToolbar
        variant={"inline"}
        format={DateFormat.DATETIME_S}
        margin={"normal"}
        label={"End index"}
        value={endIndex}
        ampm={false}
        error={!endIndexIsValid}
        helperText={endIndexIsValid ? "" : `Must be higher than ${moment(startIndex).format(DateFormat.DATETIME_S)}`}
        onChange={handleEndIndexChanged}
      />
    </>
  );
};

export default AdjustDateTimeModal;
