import { Button, ButtonGroup } from "@material-ui/core";
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { DateFormat } from "../../Constants";

export interface AdjustDateTimeModelProps {
  minDate: Moment;
  maxDate: Moment;
  onStartDateChanged: (value: Moment) => void;
  onEndDateChanged: (value: Moment) => void;
  onValidChange: (isValid: boolean) => void;
}

interface SetRangeButton {
  timeInMilliseconds: number;
  displayText: string;
}

const AdjustDateTimeModal = (props: AdjustDateTimeModelProps): React.ReactElement => {
  const { minDate, maxDate, onStartDateChanged, onEndDateChanged, onValidChange } = props;
  const [startIndex, setStartIndex] = useState<Moment>(minDate);
  const [endIndex, setEndIndex] = useState<Moment>(maxDate);
  const [startIndexIsValid, setStartIndexIsValid] = useState<boolean>();
  const [endIndexIsValid, setEndIndexIsValid] = useState<boolean>();
  const setRangeButtons: SetRangeButton[] = [
    { timeInMilliseconds: 3600000, displayText: "hour" },
    { timeInMilliseconds: 21600000, displayText: "6 hours" },
    { timeInMilliseconds: 86400000, displayText: "day" },
    { timeInMilliseconds: 604800000, displayText: "week" }
  ];
  const totalTimeSpan = Number(maxDate) - Number(minDate);

  useEffect(() => {
    onStartDateChanged(startIndex);
    onEndDateChanged(endIndex);
  }, [startIndex, endIndex]);

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
  };

  const handleEndIndexChanged = (value: Moment) => {
    setEndIndex(value);
  };

  return (
    <>
      <ButtonGroup aria-label="set time range button group" color="primary" style={{ margin: ".5rem" }}>
        {setRangeButtons.map((buttonValue) => {
          return (
            totalTimeSpan > buttonValue.timeInMilliseconds && (
              <Button
                key={"last" + buttonValue.displayText}
                onClick={() => {
                  setStartIndex(endIndex.clone().subtract(buttonValue.timeInMilliseconds, "millisecond"));
                  setEndIndex(maxDate);
                }}
              >
                {"Last " + buttonValue.displayText}
              </Button>
            )
          );
        })}
        <Button
          key={"resetRangeValues"}
          onClick={() => {
            setStartIndex(minDate);
            setEndIndex(maxDate);
          }}
        >
          Reset
        </Button>
      </ButtonGroup>

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
