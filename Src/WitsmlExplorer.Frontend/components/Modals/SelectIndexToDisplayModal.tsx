import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import { LogCurveInfoRow } from "components/ContentViews/LogCurveInfoListViewUtils";
import ModalDialog from "components/Modals/ModalDialog";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "./TrimLogObject/AdjustDepthIndexRange.tsx";
import { Banner } from "components/StyledComponents/Banner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetActiveRoute } from "hooks/useGetActiveRoute";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import {
  getLogCurveValuesViewPath,
  getMultiLogCurveValuesViewPath
} from "routes/utils/pathBuilder";
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
  const { isMultiLogsCurveInfoListView: isMultiLog } = useGetActiveRoute();
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();
  const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  const [startIndex, setStartIndex] = useState<string | number>(
    getStartIndex(log, logCurveInfoRows, isMultiLog)
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    getEndIndex(log, logCurveInfoRows, isMultiLog)
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

    if (isMultiLog) {
      return getMultiLogCurveValuesViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.Log,
        logType
      );
    }

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
    if (isMultiLog) {
      const logMnemonics = logCurveInfoRows.reduce(
        (acc, { logUid, mnemonic }) => {
          (acc[logUid] = acc[logUid] || []).push(mnemonic);
          return acc;
        },
        {} as Record<string, string[]>
      );
      return logMnemonics;
    }
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
        heading={`Display curve values within selected index range${
          isMultiLog ? "" : ` for ${log.name}`
        }`}
        content={
          <>
            {isTimeIndexed ? (
              <>
                <AdjustDateTimeIndexRange
                  minDate={
                    getStartIndex(log, logCurveInfoRows, isMultiLog) as string
                  }
                  maxDate={
                    getEndIndex(log, logCurveInfoRows, isMultiLog) as string
                  }
                  isDescending={
                    log.direction == WITSML_LOG_ORDERTYPE_DECREASING
                  }
                  onStartDateChanged={setStartIndex}
                  onEndDateChanged={setEndIndex}
                  onValidChange={toggleConfirmDisabled}
                />
              </>
            ) : (
              <AdjustDepthIndexRange
                minValue={
                  getStartIndex(log, logCurveInfoRows, isMultiLog) as number
                }
                maxValue={
                  getEndIndex(log, logCurveInfoRows, isMultiLog) as number
                }
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

const getStartIndex = (
  log: LogObject,
  logCurveInfoRows: LogCurveInfoRow[],
  isMultiLog: boolean
): string | number => {
  const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;

  if (isMultiLog) {
    if (isTimeIndexed) {
      return (
        logCurveInfoRows
          .reduce((minRow, currentRow) => {
            if (minRow.minIndex === null) return currentRow;
            if (currentRow.minIndex === null) return minRow;
            return new Date(currentRow.minIndex) < new Date(minRow.minIndex)
              ? currentRow
              : minRow;
          })
          .minIndex?.toString() ?? ""
      );
    } else {
      const min = Math.min(
        ...logCurveInfoRows.map((lci) =>
          lci.minIndex === null ? Infinity : (lci.minIndex as number)
        )
      );
      return min === Infinity ? 0 : min;
    }
  } else {
    return isTimeIndexed ? log.startIndex : indexToNumber(log.startIndex);
  }
};

const getEndIndex = (
  log: LogObject,
  logCurveInfoRows: LogCurveInfoRow[],
  isMultiLog: boolean
): string | number => {
  const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;

  if (isMultiLog) {
    if (isTimeIndexed) {
      return (
        logCurveInfoRows
          .reduce((maxRow, currentRow) =>
            new Date(currentRow.maxIndex) > new Date(maxRow.maxIndex)
              ? currentRow
              : maxRow
          )
          .maxIndex?.toString() ?? ""
      );
    } else {
      return Math.max(...logCurveInfoRows.map((lci) => lci.maxIndex as number));
    }
  } else {
    return isTimeIndexed ? log.endIndex : indexToNumber(log.endIndex);
  }
};
