import { Button } from "@equinor/eds-core-react";
import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

export interface AdjustNumberRangeModalProps {
  minValue: number;
  maxValue: number;
  isDescending?: boolean;
  onStartValueChanged: (value: number) => void;
  onEndValueChanged: (value: number) => void;
  onValidChange: (isValid: boolean) => void;
}

const AdjustNumberRangeModal = (
  props: AdjustNumberRangeModalProps
): React.ReactElement => {
  const {
    minValue,
    maxValue,
    isDescending,
    onStartValueChanged,
    onEndValueChanged,
    onValidChange
  } = props;
  const [startValue, setStartIndex] = useState<number>(minValue);
  const [endValue, setEndIndex] = useState<number>(maxValue);
  const [startIndexIsValid, setStartIndexIsValid] = useState<boolean>();
  const [endIndexIsValid, setEndIndexIsValid] = useState<boolean>();
  const setRangeButtonValues = [20, 50, 200, 1000];
  const totalDepthSpan = maxValue - minValue;

  useEffect(() => {
    onStartValueChanged(startValue);
    onEndValueChanged(endValue);
  }, [startValue, endValue]);

  useEffect(() => {
    setStartIndexIsValid(
      isDescending ? startValue > endValue : endValue > startValue
    );
    setEndIndexIsValid(
      isDescending ? startValue > endValue : endValue > startValue
    );
  }, [startValue, endValue]);

  useEffect(() => {
    onValidChange(startIndexIsValid && endIndexIsValid);
  }, [startIndexIsValid, endIndexIsValid]);

  const handleStartIndexChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value) {
      setStartIndex(Number(event.target.value));
    }
  };

  const handleEndIndexChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value) {
      setEndIndex(Number(event.target.value));
    }
  };

  return (
    <>
      <Button.Group
        aria-label="set depth range button group"
        style={{ margin: ".5rem" }}
      >
        {setRangeButtonValues.map((buttonValue) => {
          return (
            totalDepthSpan > buttonValue && (
              <Button
                key={"last" + buttonValue}
                onClick={() => {
                  setStartIndex(maxValue - buttonValue);
                  setEndIndex(maxValue);
                }}
              >
                {"Last " + buttonValue}
              </Button>
            )
          );
        })}
        <Button
          key={"resetRangeValues"}
          onClick={() => {
            setStartIndex(minValue);
            setEndIndex(maxValue);
          }}
        >
          Reset
        </Button>
      </Button.Group>
      <TextField
        fullWidth
        label={"Start index"}
        value={startValue ?? ""}
        type={"number"}
        error={!startIndexIsValid}
        helperText={
          startIndexIsValid
            ? ""
            : isDescending
            ? `Must be higher than ${endValue}`
            : `Must be lower than ${endValue}`
        }
        onChange={handleStartIndexChanged}
        style={{ paddingBottom: startIndexIsValid ? "23px" : 0 }}
      />
      <TextField
        fullWidth
        label={"End index"}
        value={endValue ?? ""}
        type={"number"}
        error={!endIndexIsValid}
        helperText={
          endIndexIsValid
            ? ""
            : isDescending
            ? `Must be lower than ${startValue}`
            : `Must be higher than ${startValue}`
        }
        onChange={handleEndIndexChanged}
        style={{ paddingBottom: endIndexIsValid ? "23px" : 0 }}
      />
    </>
  );
};

export default AdjustNumberRangeModal;
