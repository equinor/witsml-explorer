import { Button, ButtonGroup, TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";

export interface AdjustNumberRangeModalProps {
  minValue: number;
  maxValue: number;
  onStartValueChanged: (value: number) => void;
  onEndValueChanged: (value: number) => void;
  onValidChange: (isValid: boolean) => void;
}

const AdjustNumberRangeModal = (props: AdjustNumberRangeModalProps): React.ReactElement => {
  const { minValue, maxValue, onStartValueChanged, onEndValueChanged, onValidChange } = props;
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
    setStartIndexIsValid(startValue < endValue);
    setEndIndexIsValid(endValue > startValue);
  }, [startValue, endValue]);

  useEffect(() => {
    onValidChange(startIndexIsValid && endIndexIsValid);
  }, [startIndexIsValid, endIndexIsValid]);

  const handleStartIndexChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setStartIndex(Number(event.target.value));
    }
  };

  const handleEndIndexChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setEndIndex(Number(event.target.value));
    }
  };

  return (
    <>
      <ButtonGroup aria-label="set depth range button group" color="primary" style={{ margin: ".5rem" }}>
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
      </ButtonGroup>
      <TextField
        fullWidth
        label={"Start index"}
        value={startValue}
        type={"number"}
        error={!startIndexIsValid}
        helperText={startIndexIsValid ? "" : `Must be lower than ${endValue}`}
        onChange={handleStartIndexChanged}
      />
      <TextField
        fullWidth
        label={"End index"}
        value={endValue}
        type={"number"}
        error={!endIndexIsValid}
        helperText={endIndexIsValid ? "" : `Must be higher than ${maxValue}`}
        onChange={handleEndIndexChanged}
      />
    </>
  );
};

export default AdjustNumberRangeModal;
