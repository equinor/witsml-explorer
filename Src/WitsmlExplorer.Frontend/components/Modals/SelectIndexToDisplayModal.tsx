import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import { LogCurveInfoRow } from "components/ContentViews/LogCurveInfoListView";
import ModalDialog from "components/Modals/ModalDialog";
import AdjustDateTimeModal from "components/Modals/TrimLogObject/AdjustDateTimeModal";
import AdjustNumberRangeModal from "components/Modals/TrimLogObject/AdjustNumberRangeModal";
import { SelectLogCurveInfoAction } from "contexts/navigationActions";
import NavigationType from "contexts/navigationType";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import React, { useEffect, useState } from "react";
import { formatIndexValue, indexToNumber } from "tools/IndexHelpers";

export interface SelectIndexToDisplayModalProps {
  dispatchNavigation: (action: SelectLogCurveInfoAction) => void;
  dispatchOperation: (action: HideModalAction) => void;
  selectedLog: LogObject;
  selectedLogCurveInfoRow: LogCurveInfoRow[];
}

const SelectIndexToDisplayModal = (
  props: SelectIndexToDisplayModalProps
): React.ReactElement => {
  const {
    selectedLogCurveInfoRow,
    dispatchNavigation,
    dispatchOperation,
    selectedLog
  } = props;
  const isTimeIndexed = selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  const [log, setLog] = useState<LogObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<string | number>(
    isTimeIndexed
      ? selectedLog.startIndex
      : indexToNumber(selectedLog.startIndex)
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    isTimeIndexed ? selectedLog.endIndex : indexToNumber(selectedLog.endIndex)
  );
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();

  useEffect(() => {
    setLog(selectedLog);
  }, [selectedLog]);

  const onSubmit = async () => {
    setIsLoading(true);
    const logCurveInfoWithUpdatedIndex = selectedLogCurveInfoRow.map(
      (logCurveInfo: LogCurveInfoRow) => {
        return {
          ...logCurveInfo,
          minIndex: formatIndexValue(startIndex),
          maxIndex: formatIndexValue(endIndex)
        };
      }
    );
    dispatchOperation({ type: OperationType.HideModal });
    dispatchNavigation({
      type: NavigationType.ShowCurveValues,
      payload: { logCurveInfo: logCurveInfoWithUpdatedIndex }
    });
  };

  const toggleConfirmDisabled = (isValid: boolean) => {
    setConfirmDisabled(!isValid);
  };

  return (
    <>
      {log && (
        <ModalDialog
          heading={`Display curve values within selected index range for ${log.name}`}
          content={
            <>
              {isTimeIndexed ? (
                <>
                  <AdjustDateTimeModal
                    minDate={log.startIndex}
                    maxDate={log.endIndex}
                    isDescending={
                      log.direction == WITSML_LOG_ORDERTYPE_DECREASING
                    }
                    onStartDateChanged={setStartIndex}
                    onEndDateChanged={setEndIndex}
                    onValidChange={toggleConfirmDisabled}
                  />
                </>
              ) : (
                <AdjustNumberRangeModal
                  minValue={indexToNumber(log.startIndex)}
                  maxValue={indexToNumber(log.endIndex)}
                  isDescending={
                    log.direction == WITSML_LOG_ORDERTYPE_DECREASING
                  }
                  onStartValueChanged={setStartIndex}
                  onEndValueChanged={setEndIndex}
                  onValidChange={toggleConfirmDisabled}
                />
              )}
            </>
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
          confirmColor={"primary"}
          confirmText={"View curve values"}
          confirmDisabled={confirmDisabled}
        />
      )}
    </>
  );
};

export default SelectIndexToDisplayModal;
