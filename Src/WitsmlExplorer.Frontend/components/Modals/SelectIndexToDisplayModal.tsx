import React, { useEffect, useState } from "react";
import moment, { Moment } from "moment";
import LogObject from "../../models/logObject";
import ModalDialog from "./ModalDialog";
import { WITSML_INDEX_TYPE_DATE_TIME } from "../Constants";
import AdjustNumberRangeModal from "./TrimLogObject/AdjustNumberRangeModal";
import AdjustDateTimeModal from "./TrimLogObject/AdjustDateTimeModal";
import OperationType from "../../contexts/operationType";
import NavigationType from "../../contexts/navigationType";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import { SelectLogCurveInfoAction } from "../../contexts/navigationStateReducer";
import { HideModalAction } from "../../contexts/operationStateReducer";

export interface SelectIndexToDisplayModalProps {
  dispatchNavigation: (action: SelectLogCurveInfoAction) => void;
  dispatchOperation: (action: HideModalAction) => void;
  selectedLog: LogObject;
  selectedLogCurveInfoRow: LogCurveInfoRow[];
}

const SelectIndexToDisplayModal = (props: SelectIndexToDisplayModalProps): React.ReactElement => {
  const { selectedLogCurveInfoRow, dispatchNavigation, dispatchOperation, selectedLog } = props;
  const isTimeIndexed = selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  const [log, setLog] = useState<LogObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<Moment | number>(isTimeIndexed ? moment(selectedLog.startIndex) : indexToNumber(selectedLog.startIndex));
  const [endIndex, setEndIndex] = useState<Moment | number>(isTimeIndexed ? moment(selectedLog.endIndex) : indexToNumber(selectedLog.endIndex));
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();

  useEffect(() => {
    setLog(selectedLog);
  }, [selectedLog]);

  const onSubmit = async () => {
    setIsLoading(true);
    const logCurveInfoWithUpdatedIndex = selectedLogCurveInfoRow.map((logCurveInfo: LogCurveInfoRow) => {
      return {
        ...logCurveInfo,
        minIndex: formatIndexValue(startIndex),
        maxIndex: formatIndexValue(endIndex)
      };
    });
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
                    minDate={moment(log.startIndex)}
                    maxDate={moment(log.endIndex)}
                    onStartDateChanged={setStartIndex}
                    onEndDateChanged={setEndIndex}
                    onValidChange={toggleConfirmDisabled}
                  />
                </>
              ) : (
                <AdjustNumberRangeModal
                  minValue={indexToNumber(log.startIndex)}
                  maxValue={indexToNumber(log.endIndex)}
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

const indexToNumber = (index: string): number => {
  return Number(index.replace(/[^\d.-]/g, ""));
};

const formatIndexValue = (value: Moment | number): string => {
  return typeof value === "number" ? String(value) : (value as Moment).toDate().toISOString();
};

export default SelectIndexToDisplayModal;
