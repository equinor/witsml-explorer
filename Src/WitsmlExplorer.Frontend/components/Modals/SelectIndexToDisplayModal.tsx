import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { SelectLogCurveInfoAction } from "../../contexts/navigationActions";
import NavigationType from "../../contexts/navigationType";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { formatIndexValue, indexToNumber } from "../../tools/IndexHelpers";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "../Constants";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import ModalDialog from "./ModalDialog";
import AdjustDateTimeModal from "./TrimLogObject/AdjustDateTimeModal";
import AdjustNumberRangeModal from "./TrimLogObject/AdjustNumberRangeModal";

export interface SelectIndexToDisplayModalProps {
  dispatchNavigation: (action: SelectLogCurveInfoAction) => void;
  dispatchOperation: (action: HideModalAction) => void;
  selectedLog: LogObject;
  selectedWell: Well;
  selectedWellbore: Wellbore;
  selectedLogCurveInfoRow: LogCurveInfoRow[];
}

const SelectIndexToDisplayModal = (
  props: SelectIndexToDisplayModalProps
): React.ReactElement => {
  const {
    selectedLogCurveInfoRow,
    dispatchNavigation,
    dispatchOperation,
    selectedWell,
    selectedWellbore,
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
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

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
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/logs/logtypes/${
        selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME ? "time" : "depth"
      }/objects/${selectedLog.uid}/curvevalues`
    );
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
