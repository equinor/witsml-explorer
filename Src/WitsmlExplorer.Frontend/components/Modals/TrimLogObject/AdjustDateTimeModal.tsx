import { Button } from "@equinor/eds-core-react";
import {
  dateTimeFormatNoOffset,
  getOffset,
  validateIsoDateStringNoOffset
} from "components/DateFormatter";
import { LogHeaderDateTimeField } from "components/Modals/LogHeaderDateTimeField";
import { addMilliseconds } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import React, { useEffect, useState } from "react";

export interface AdjustDateTimeModelProps {
  minDate: string;
  maxDate: string;
  isDescending?: boolean;
  onStartDateChanged: (value: string) => void;
  onEndDateChanged: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

interface SetRangeButton {
  timeInMilliseconds: number;
  displayText: string;
}

const AdjustDateTimeModal = (
  props: AdjustDateTimeModelProps
): React.ReactElement => {
  const {
    minDate,
    maxDate,
    isDescending,
    onStartDateChanged,
    onEndDateChanged,
    onValidChange
  } = props;
  const [startOffset] = useState<string>(getOffset(minDate));
  const [endOffset] = useState<string>(getOffset(maxDate));
  const [startIndex, setStartIndex] = useState<string>(
    formatInTimeZone(minDate, startOffset, dateTimeFormatNoOffset)
  );
  const [endIndex, setEndIndex] = useState<string>(
    formatInTimeZone(maxDate, endOffset, dateTimeFormatNoOffset)
  );
  const [startIndexInitiallyEmpty] = useState<boolean>(
    startIndex == null || startIndex === ""
  );
  const [endIndexInitiallyEmpty] = useState<boolean>(
    endIndex == null || endIndex === ""
  );
  const setRangeButtons: SetRangeButton[] = [
    { timeInMilliseconds: 3600000, displayText: "hour" },
    { timeInMilliseconds: 21600000, displayText: "6 hours" },
    { timeInMilliseconds: 86400000, displayText: "day" },
    { timeInMilliseconds: 604800000, displayText: "week" }
  ];
  const totalTimeSpan = toDate(maxDate).getTime() - toDate(minDate).getTime();
  const startIndexMinValue = isDescending ? endIndex : null;
  const startIndexMaxValue = isDescending ? null : endIndex;
  const endIndexMinValue = isDescending ? null : startIndex;
  const endIndexMaxValue = isDescending ? startIndex : null;

  const validate = (
    current: string,
    offset: string,
    minValue: string,
    maxValue: string,
    initiallyEmpty: boolean
  ) => {
    return (
      (validateIsoDateStringNoOffset(current, offset) &&
        (!minValue || current >= minValue) &&
        (!maxValue || current <= maxValue)) ||
      (initiallyEmpty && (current == null || current === ""))
    );
  };

  useEffect(() => {
    onStartDateChanged(startIndex + startOffset);
    onEndDateChanged(endIndex + endOffset);
  }, [startIndex, endIndex]);

  useEffect(() => {
    const startIndexIsValid = validate(
      startIndex,
      startOffset,
      startIndexMinValue,
      startIndexMaxValue,
      startIndexInitiallyEmpty
    );
    const endIndexIsValid = validate(
      endIndex,
      endOffset,
      endIndexMinValue,
      endIndexMaxValue,
      endIndexInitiallyEmpty
    );
    onValidChange(
      startIndexIsValid &&
        endIndexIsValid &&
        (isDescending ? startIndex > endIndex : startIndex < endIndex)
    );
  }, [startIndex, endIndex]);

  return (
    <>
      {/* TODO: Move button? */}
      <Button.Group
        aria-label="set time range button group"
        style={{ margin: ".5rem" }}
      >
        {setRangeButtons.map((buttonValue) => {
          return (
            totalTimeSpan > buttonValue.timeInMilliseconds && (
              <Button
                key={"last" + buttonValue.displayText}
                onClick={() => {
                  const newStartIndex = addMilliseconds(
                    toDate(endIndex + endOffset),
                    -buttonValue.timeInMilliseconds
                  );
                  setStartIndex(
                    formatInTimeZone(
                      newStartIndex,
                      startOffset,
                      dateTimeFormatNoOffset
                    )
                  );
                  setEndIndex(
                    formatInTimeZone(maxDate, endOffset, dateTimeFormatNoOffset)
                  );
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
            setStartIndex(
              formatInTimeZone(minDate, startOffset, dateTimeFormatNoOffset)
            );
            setEndIndex(
              formatInTimeZone(maxDate, endOffset, dateTimeFormatNoOffset)
            );
          }}
        >
          Reset
        </Button>
      </Button.Group>

      <LogHeaderDateTimeField
        value={startIndex ?? ""}
        label="Start index"
        updateObject={(dateTime: string) => {
          setStartIndex(dateTime);
        }}
        offset={startOffset}
        minValue={startIndexMinValue}
        maxValue={startIndexMaxValue}
      />
      <LogHeaderDateTimeField
        value={endIndex ?? ""}
        label="End index"
        updateObject={(dateTime: string) => {
          setEndIndex(dateTime);
        }}
        offset={endOffset}
        minValue={endIndexMinValue}
        maxValue={endIndexMaxValue}
      />
    </>
  );
};

export default AdjustDateTimeModal;
