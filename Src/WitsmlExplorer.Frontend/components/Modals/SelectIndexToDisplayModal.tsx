import React, { useContext, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
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
  log: LogObject;
  wellUid: string;
  wellboreUid: string;
  logCurveInfoRows: LogCurveInfoRow[];
}

const SelectIndexToDisplayModal = (
  props: SelectIndexToDisplayModalProps
): React.ReactElement => {
  const {
    logCurveInfoRows: logCurveInfoRow,
    wellUid,
    wellboreUid,
    log
  } = props;
  const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  const { dispatchOperation } = useContext(OperationContext);
  const [startIndex, setStartIndex] = useState<string | number>(
    isTimeIndexed ? log.startIndex : indexToNumber(log.startIndex)
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    isTimeIndexed ? log.endIndex : indexToNumber(log.endIndex)
  );
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    // TODO: JSON.stringify adds a lot of meta around the mnemonics. Are there better options?
    // TODO: Handle max length of URL.
    const searchParams = createSearchParams({
      mnemonics: JSON.stringify(
        logCurveInfoRow
          .filter((row) => row.mnemonic !== log.indexCurve)
          .map((row) => row.mnemonic)
      ),
      startIndex: formatIndexValue(startIndex),
      endIndex: formatIndexValue(endIndex)
    });
    navigate({
      pathname: `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.Log
      }/logtypes/${
        log.indexType === WITSML_INDEX_TYPE_DATE_TIME ? "time" : "depth"
      }/objects/${log.uid}/curvevalues`,
      search: searchParams.toString()
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
          onSubmit={onSubmit}
          isLoading={false}
          confirmColor={"primary"}
          confirmText={"View curve values"}
          confirmDisabled={confirmDisabled}
        />
      )}
    </>
  );
};

export default SelectIndexToDisplayModal;
