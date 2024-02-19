import React, { useContext, useState } from "react";
import { useConnectedServer } from "../../contexts/connectedServerContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import {
  CopyRangeClipboard,
  createComponentReferences
} from "../../models/jobs/componentReferences";
import LogObject, { indexToNumber } from "../../models/logObject";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "../Constants";
import ModalDialog from "./ModalDialog";
import AdjustDateTimeModal from "./TrimLogObject/AdjustDateTimeModal";
import AdjustNumberRangeModal from "./TrimLogObject/AdjustNumberRangeModal";

export interface CopyRangeModalProps {
  logObject: LogObject;
  mnemonics: string[];
}

const CopyRangeModal = (props: CopyRangeModalProps): React.ReactElement => {
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useContext(OperationContext);
  const [startIndex, setStartIndex] = useState<string | number>();
  const [endIndex, setEndIndex] = useState<string | number>();
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>(true);
  const { logObject: selectedLog } = props;

  const onSubmit = async () => {
    const componentReferences: CopyRangeClipboard = createComponentReferences(
      props.mnemonics,
      selectedLog,
      ComponentType.Mnemonic,
      connectedServer?.url
    );
    componentReferences.startIndex = startIndex.toString();
    componentReferences.endIndex = endIndex.toString();
    await navigator.clipboard.writeText(JSON.stringify(componentReferences));
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
            <AdjustDateTimeModal
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
            <AdjustNumberRangeModal
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
