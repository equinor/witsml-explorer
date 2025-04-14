import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import ModalDialog from "components/Modals/ModalDialog";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "./TrimLogObject/AdjustDepthIndexRange.tsx";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import {
  CopyRangeClipboard,
  createComponentReferences
} from "models/jobs/componentReferences";
import LogObject, { indexToNumber } from "models/logObject";
import React, { useState } from "react";

export interface CopyRangeModalProps {
  logObject: LogObject;
  mnemonics: string[];
  onSubmit?: (minIndex: string | number, maxIndex: string | number) => void;
  infoMessage?: string;
}

const CopyRangeModal = (props: CopyRangeModalProps): React.ReactElement => {
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useOperationState();
  const [startIndex, setStartIndex] = useState<string | number>();
  const [endIndex, setEndIndex] = useState<string | number>();
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>(true);
  const { logObject: selectedLog, onSubmit: onSubmitOverride } = props;

  const onSubmit = async () => {
    if (onSubmitOverride) {
      onSubmitOverride(startIndex, endIndex);
    } else {
      const componentReferences: CopyRangeClipboard = createComponentReferences(
        props.mnemonics,
        selectedLog,
        ComponentType.Mnemonic,
        connectedServer.url
      );
      componentReferences.startIndex = startIndex.toString();
      componentReferences.endIndex = endIndex.toString();
      await navigator.clipboard.writeText(JSON.stringify(componentReferences));
    }
    dispatchOperation({ type: OperationType.HideModal });
  };

  const toggleConfirmDisabled = (isValid: boolean) => {
    setConfirmDisabled(!isValid);
  };

  return (
    <ModalDialog
      heading={`Pick the range to copy`}
      content={
        <>
          {selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME && (
            <AdjustDateTimeIndexRange
              minDate={selectedLog.startIndex}
              maxDate={selectedLog.endIndex}
              isDescending={
                selectedLog.direction == WITSML_LOG_ORDERTYPE_DECREASING
              }
              onStartDateChanged={setStartIndex}
              onEndDateChanged={setEndIndex}
              onValidChange={toggleConfirmDisabled}
            />
          )}
          {selectedLog.indexType === WITSML_INDEX_TYPE_MD && (
            <AdjustDepthIndexRange
              minValue={indexToNumber(selectedLog.startIndex)}
              maxValue={indexToNumber(selectedLog.endIndex)}
              isDescending={
                selectedLog.direction == WITSML_LOG_ORDERTYPE_DECREASING
              }
              onStartValueChanged={setStartIndex}
              onEndValueChanged={setEndIndex}
              onValidChange={toggleConfirmDisabled}
            />
          )}
          {props.infoMessage !== undefined && <p>{props.infoMessage} </p>}
        </>
      }
      isLoading={false}
      onSubmit={onSubmit}
      confirmText={"Copy"}
      confirmDisabled={confirmDisabled}
      switchButtonPlaces
    />
  );
};

export default CopyRangeModal;
