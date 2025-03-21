import { LogHeaderDateTimeField } from "components/Modals/LogHeaderDateTimeField";
import { addMilliseconds } from "date-fns";
import { toDate } from "date-fns-tz";
import React, { useEffect, useState } from "react";
import { Button } from "../../StyledComponents/Button.tsx";

export interface AdjustDateTimeIndexRangeProps {
  minDate: string;
  maxDate: string;
  isDescending?: boolean;
  hideSetButtons?: boolean;
  onStartDateChanged: (value: string) => void;
  onEndDateChanged: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

interface SetRangeButton {
  timeInMilliseconds: number;
  displayText: string;
}

const AdjustDateTimeIndexRange = (
  props: AdjustDateTimeIndexRangeProps
): React.ReactElement => {
  const {
    minDate,
    maxDate,
    isDescending,
    hideSetButtons,
    onStartDateChanged,
    onEndDateChanged,
    onValidChange
  } = props;
  const [startIndex, setStartIndex] = useState<string>(minDate);
  const [endIndex, setEndIndex] = useState<string>(maxDate);
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
    minValue: string,
    maxValue: string,
    initiallyEmpty: boolean
  ) => {
    return (
      ((!minValue || current >= minValue) &&
        (!maxValue || current <= maxValue)) ||
      (initiallyEmpty && (current == null || current === ""))
    );
  };

  useEffect(() => {
    onStartDateChanged(startIndex);
    onEndDateChanged(endIndex);
  }, [startIndex, endIndex]);

  useEffect(() => {
    const startIndexIsValid = validate(
      startIndex,
      startIndexMinValue,
      startIndexMaxValue,
      startIndexInitiallyEmpty
    );
    const endIndexIsValid = validate(
      endIndex,
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
      <Button.Group
        aria-label="set time range button group"
        style={{ margin: ".5rem" }}
      >
        {!hideSetButtons &&
          setRangeButtons.map((buttonValue) => {
            return (
              totalTimeSpan > buttonValue.timeInMilliseconds && (
                <Button
                  key={"last" + buttonValue.displayText}
                  onClick={() => {
                    const newStartIndex = addMilliseconds(
                      toDate(endIndex),
                      -buttonValue.timeInMilliseconds
                    );
                    setStartIndex(newStartIndex.toISOString());
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
      </Button.Group>

      <LogHeaderDateTimeField
        value={startIndex ?? ""}
        label="Start index"
        updateObject={(dateTime: string) => {
          setStartIndex(dateTime);
        }}
        minValue={startIndexMinValue}
        maxValue={startIndexMaxValue}
      />
      <LogHeaderDateTimeField
        value={endIndex ?? ""}
        label="End index"
        updateObject={(dateTime: string) => {
          setEndIndex(dateTime);
        }}
        minValue={endIndexMinValue}
        maxValue={endIndexMaxValue}
      />
    </>
  );
};

export default AdjustDateTimeIndexRange;
