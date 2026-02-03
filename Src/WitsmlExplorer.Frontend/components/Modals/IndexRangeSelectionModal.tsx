import ModalDialog from "./ModalDialog.tsx";
import OperationType from "../../contexts/operationType.ts";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import AdjustDepthIndexRange from "./TrimLogObject/AdjustDepthIndexRange.tsx";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import React, { useState } from "react";

export interface IndexRangeSelectionModalProps {
  isDepthIndex: boolean;
  startIndex: string | number;
  endIndex: string | number;
  onSubmitIndexRange: (
    startIndex: string | number,
    endIndex: string | number
  ) => void;
}

const IndexRangeSelectionModal = (
  props: IndexRangeSelectionModalProps
): React.ReactElement => {
  const { isDepthIndex, startIndex, endIndex, onSubmitIndexRange } = props;

  const { dispatchOperation } = useOperationState();

  const [isValidRange, setIsValidRange] = useState<boolean>(true);
  const [startIndexValue, setStartIndexValue] = useState<string | number>(
    startIndex
  );
  const [endIndexValue, setEndIndexValue] = useState<string | number>(endIndex);

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    onSubmitIndexRange(startIndexValue, endIndexValue);
  };

  return (
    <>
      <ModalDialog
        heading={
          `Select ` + (isDepthIndex ? `depth` : `date time`) + ` index range`
        }
        confirmText={`OK`}
        content={
          isDepthIndex ? (
            <AdjustDepthIndexRange
              minValue={startIndexValue as number}
              maxValue={endIndexValue as number}
              isDescending={false}
              onStartValueChanged={setStartIndexValue}
              onEndValueChanged={setEndIndexValue}
              onValidChange={setIsValidRange}
            />
          ) : (
            <AdjustDateTimeIndexRange
              minDate={startIndexValue as string}
              maxDate={endIndexValue as string}
              isDescending={false}
              onStartDateChanged={setStartIndexValue}
              onEndDateChanged={setEndIndexValue}
              onValidChange={setIsValidRange}
            />
          )
        }
        onSubmit={() => onSubmit()}
        isLoading={false}
        confirmDisabled={!isValidRange}
      />
    </>
  );
};

export default IndexRangeSelectionModal;
