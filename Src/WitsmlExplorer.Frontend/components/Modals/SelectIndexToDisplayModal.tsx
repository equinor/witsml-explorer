import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import { LogCurveInfoRow } from "components/ContentViews/LogCurveInfoListView";
import ModalDialog from "components/Modals/ModalDialog";
import AdjustDateTimeModal from "components/Modals/TrimLogObject/AdjustDateTimeModal";
import AdjustNumberRangeModal from "components/Modals/TrimLogObject/AdjustNumberRangeModal";
import { Banner } from "components/StyledComponents/Banner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import { getLogCurveValuesViewPath } from "routes/utils/pathBuilder";
import { indexToNumber } from "tools/IndexHelpers";
import { checkIsUrlTooLong } from "../../routes/utils/checkIsUrlTooLong";
import { createLogCurveValuesSearchParams } from "../../routes/utils/createLogCurveValuesSearchParams";
import Icon from "../../styles/Icons";

export interface SelectIndexToDisplayModalProps {
  log: LogObject;
  wellUid: string;
  wellboreUid: string;
  logCurveInfoRows: LogCurveInfoRow[];
}

const SelectIndexToDisplayModal = (
  props: SelectIndexToDisplayModalProps
): React.ReactElement => {
  const { logCurveInfoRows, wellUid, wellboreUid, log } = props;
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  const [startIndex, setStartIndex] = useState<string | number>(
    isTimeIndexed ? log.startIndex : indexToNumber(log.startIndex)
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    isTimeIndexed ? log.endIndex : indexToNumber(log.endIndex)
  );
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const isUrlTooLong = checkIsUrlTooLong(
    getToPathname(),
    createLogCurveValuesSearchParams(startIndex, endIndex, getMnemonics())
  );

  function getToPathname() {
    const logType =
      log.indexType === WITSML_INDEX_TYPE_DATE_TIME
        ? RouterLogType.TIME
        : RouterLogType.DEPTH;
    return getLogCurveValuesViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      ObjectType.Log,
      logType,
      log.uid
    );
  }

  function getMnemonics() {
    return logCurveInfoRows
      .filter((row) => row.mnemonic !== log.indexCurve)
      .map((row) => row.mnemonic);
  }

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const searchParams = isUrlTooLong
      ? createLogCurveValuesSearchParams(startIndex, endIndex)
      : createLogCurveValuesSearchParams(startIndex, endIndex, getMnemonics());
    navigate(
      { pathname: getToPathname(), search: searchParams.toString() },
      {
        state: {
          mnemonics: JSON.stringify(getMnemonics())
        }
      }
    );
  };

  const toggleConfirmDisabled = (isValid: boolean) => {
    setConfirmDisabled(!isValid);
  };

  return (
    log && (
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
                isDescending={log.direction == WITSML_LOG_ORDERTYPE_DECREASING}
                onStartValueChanged={setStartIndex}
                onEndValueChanged={setEndIndex}
                onValidChange={toggleConfirmDisabled}
              />
            )}
            {isUrlTooLong && (
              <Banner colors={colors}>
                <Banner.Icon variant="warning">
                  <Icon name="infoCircle" />
                </Banner.Icon>
                <Banner.Message>
                  The selected number of mnemonics is too large to be saved in
                  the URL because the URL exceeds the maximum length of 2000
                  characters. Therefore, it will not be possible to share this
                  URL with others to open the chosen mnemonics on the given log.
                </Banner.Message>
              </Banner>
            )}
          </>
        }
        onSubmit={onSubmit}
        isLoading={false}
        confirmColor={"primary"}
        confirmText={"View curve values"}
        confirmDisabled={confirmDisabled}
      />
    )
  );
};

export default SelectIndexToDisplayModal;
