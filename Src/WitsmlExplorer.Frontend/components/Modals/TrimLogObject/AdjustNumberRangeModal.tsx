import React, { useEffect, useState } from "react";
import { Button, TextField } from "@material-ui/core";
import styled from "styled-components";

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
  const buttonValues = [20, 50, 200, 1000];
  const totalValueRange = maxValue - minValue;

  useEffect(() => {
    onStartValueChanged(startValue);
    onEndValueChanged(endValue);
  }, []);

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
      onStartValueChanged(Number(event.target.value));
    }
  };

  const handleEndIndexChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setEndIndex(Number(event.target.value));
      onEndValueChanged(Number(event.target.value));
    }
  };

  return (
    <>
      <ButtonRow>
        {buttonValues.map((buttonValue) => {
          return (totalValueRange > buttonValue) && (
            <Button
              key={"last" + buttonValue}
              onClick={() => {
                setStartIndex(endValue - buttonValue);
                onStartValueChanged(endValue - buttonValue);
              }}
            >
              {"Last " + buttonValue}
            </Button>
          )
        })}
        <Button
          key={"resetRangeValues"}
          onClick={() => {
            setStartIndex(minValue);
            onStartValueChanged(minValue);
            setEndIndex(maxValue);
            onEndValueChanged(maxValue)
          }}>
          Reset
        </Button>
      </ButtonRow>

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

const ButtonRow = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: start;
  gap: 1rem;
`

export default AdjustNumberRangeModal;
