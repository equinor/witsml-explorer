import { Button, ButtonGroup } from "@material-ui/core";
import { addMilliseconds } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import React, { useEffect, useState } from "react";
import { dateTimeFormatNoOffset, getOffset } from "../../DateFormatter";
import { LogHeaderDateTimeField } from "../LogHeaderDateTimeField";

export interface AdjustDateTimeModelProps {
  minDate: string;
  maxDate: string;
  onStartDateChanged: (value: string) => void;
  onEndDateChanged: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

interface SetRangeButton {
  timeInMilliseconds: number;
  displayText: string;
}

const AdjustDateTimeModal = (props: AdjustDateTimeModelProps): React.ReactElement => {
  const { minDate, maxDate, onStartDateChanged, onEndDateChanged, onValidChange } = props;
  const [startIndexIsValid, setStartIndexIsValid] = useState<boolean>(true);
  const [endIndexIsValid, setEndIndexIsValid] = useState<boolean>(true);
  const [startOffset] = useState<string>(getOffset(minDate));
  const [endOffset] = useState<string>(getOffset(maxDate));
  const [startIndex, setStartIndex] = useState<string>(formatInTimeZone(minDate, startOffset, dateTimeFormatNoOffset));
  const [endIndex, setEndIndex] = useState<string>(formatInTimeZone(maxDate, endOffset, dateTimeFormatNoOffset));
  const setRangeButtons: SetRangeButton[] = [
    { timeInMilliseconds: 3600000, displayText: "hour" },
    { timeInMilliseconds: 21600000, displayText: "6 hours" },
    { timeInMilliseconds: 86400000, displayText: "day" },
    { timeInMilliseconds: 604800000, displayText: "week" }
  ];
  const totalTimeSpan = toDate(maxDate).getTime() - toDate(minDate).getTime();

  useEffect(() => {
    onStartDateChanged(startIndex + startOffset);
    onEndDateChanged(endIndex + endOffset);
  }, [startIndex, endIndex]);

  useEffect(() => {
    onValidChange(startIndexIsValid && endIndexIsValid && startIndex < endIndex);
  }, [startIndexIsValid, endIndexIsValid, startIndex, endIndex]);

  return (
    <>
      <ButtonGroup aria-label="set time range button group" color="primary" style={{ margin: ".5rem" }}>
        {setRangeButtons.map((buttonValue) => {
          return (
            totalTimeSpan > buttonValue.timeInMilliseconds && (
              <Button
                key={"last" + buttonValue.displayText}
                onClick={() => {
                  const newStartIndex = addMilliseconds(toDate(endIndex + endOffset), -buttonValue.timeInMilliseconds);
                  setStartIndex(formatInTimeZone(newStartIndex, startOffset, dateTimeFormatNoOffset));
                  setEndIndex(formatInTimeZone(maxDate, endOffset, dateTimeFormatNoOffset));
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
            setStartIndex(formatInTimeZone(minDate, startOffset, dateTimeFormatNoOffset));
            setEndIndex(formatInTimeZone(maxDate, endOffset, dateTimeFormatNoOffset));
          }}
        >
          Reset
        </Button>
      </ButtonGroup>

      <LogHeaderDateTimeField
        value={startIndex ?? ""}
        label="Start index"
        updateObject={(dateTime: string, valid: boolean) => {
          setStartIndex(dateTime);
          setEndIndexIsValid(valid);
        }}
        offset={startOffset}
        maxValue={endIndex}
      />
      <LogHeaderDateTimeField
        value={endIndex ?? ""}
        label="End index"
        updateObject={(dateTime: string, valid: boolean) => {
          setEndIndex(dateTime);
          setStartIndexIsValid(valid);
        }}
        offset={endOffset}
        minValue={startIndex}
      />
    </>
  );
};

export default AdjustDateTimeModal;
