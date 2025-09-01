import React, { useEffect, useMemo, useState } from "react";
import { ProgressSpinnerOverlay } from "../../ProgressSpinner.tsx";
import { ContentTable, ContentTableColumn } from "../table";
import {
  getColumns,
  getTableData,
  LogCurveInfoRow
} from "../LogCurveInfoListViewUtils.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { useCurveThreshold } from "../../../contexts/curveThresholdContext.tsx";
import LogObject from "../../../models/logObject.tsx";
import { Server } from "../../../models/server.ts";
import LogObjectService from "../../../services/logObjectService.tsx";
import LogCurveInfo from "../../../models/logCurveInfo.ts";
import {
  GetEndIndex,
  GetStartIndex,
  MultiLogSelectionCurveInfo
} from "../../MultiLogUtils.tsx";
import { CommonPanelContainer } from "../../StyledComponents/Container.tsx";
import AdjustDateTimeIndexRange from "../../Modals/TrimLogObject/AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "../../Modals/TrimLogObject/AdjustDepthIndexRange.tsx";
import { Button } from "../../StyledComponents/Button.tsx";

interface MultiLogCurveSelectionListProps {
  multiLogSelectionCurveInfos: MultiLogSelectionCurveInfo[];
  logInfos: {
    server: Server;
    wellId: string;
    wellboreId: string;
    logId: string;
  }[];
  logObjects: LogObject[];
  // logCurveInfoRows: LogCurveInfoRow[];
  isDepthIndex: boolean;
  // onValidChange: (isValid: boolean) => void;
  onStartIndexChange: (startIndex: string | number) => void;
  onEndIndexChange: (endIndex: string | number) => void;
  // onRowSelectionChange?: (rows: ContentTableRow[]) => void;
  onRemoveAll: () => void;
  onRemoveSelected: () => void;
  onShowValues: (selectedRows: LogCurveInfoRow[]) => void;
}

const MultiLogCurveSelectionList = (
  props: MultiLogCurveSelectionListProps
): React.ReactElement => {
  const {
    multiLogSelectionCurveInfos,
    logInfos,
    logObjects,
    isDepthIndex,
    // logCurveInfoRows,
    // onValidChange,
    onStartIndexChange,
    onEndIndexChange,
    // onRowSelectionChange,
    onRemoveAll,
    onRemoveSelected,
    onShowValues
  } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const { curveThreshold } = useCurveThreshold();
  const [logObjectMap, setLogObjectMap] = useState<Map<string, LogObject>>();
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);

  // const [startIndex, setStartIndex] = useState<string | number>(
  //   getStartIndex(isDepthIndex, logCurveInfoRows)
  // );
  // const [endIndex, setEndIndex] = useState<string | number>(
  //   getEndIndex(isDepthIndex, logCurveInfoRows)
  // );
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(true);
  const [isFetchedLogs, setIsFetchedLogs] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<LogCurveInfoRow[]>([]);

  useEffect(() => {
    const getLogObjects = async () => {
      if (!isFetchedLogs && logInfos?.length > 0 && logObjects?.length > 0) {
        setIsFetchingLogs(true);

        let fetchingCount = logInfos.length;

        let logInfoProcessed: {
          serverId: string;
          wellId: string;
          wellboreId: string;
        }[] = [];

        const map = new Map<string, LogObject>();
        logObjects.forEach((lo) => map.set(lo.uid, lo));
        setLogObjectMap(map);

        let lcis: LogCurveInfo[] = [];

        for (const logInfo of logInfos) {
          if (
            logInfoProcessed.some(
              (lip) =>
                lip.wellboreId == logInfo.wellboreId &&
                lip.wellId == logInfo.wellId &&
                lip.serverId == logInfo.server.id
            )
          ) {
            fetchingCount--;
            continue;
          }

          const logs = logInfos.filter(
            (lo) =>
              lo.wellboreId == logInfo.wellboreId &&
              lo.wellId == logInfo.wellId &&
              lo.server.id == logInfo.server.id
          );

          if (!!logs && logs.length > 0) {
            const mnemonics = multiLogSelectionCurveInfos
              .filter(
                (i) =>
                  i.wellboreId == logInfo.wellboreId &&
                  i.wellId == logInfo.wellId &&
                  i.serverId == logInfo.server.id
              )
              .map((i) => i.mnemonic);

            const mlcis = await LogObjectService.getMultiLogsCurveInfo(
              logInfo.wellId,
              logInfo.wellboreId,
              logs.map((l) => l.logId),
              new AbortController().signal,
              logInfo.server
            );

            const mciFiltered = mlcis.filter((mlci) =>
              mnemonics.some((m) => m === mlci.mnemonic)
            );
            if (!!mciFiltered && mciFiltered.length > 0) {
              lcis = lcis.concat(...mciFiltered);
            }

            fetchingCount--;
            if (fetchingCount < 1) {
              setLogCurveInfoList(lcis);
              setIsFetchingLogs(false);
              setIsFetchedLogs(true);
            }
          } else {
            fetchingCount--;
          }

          logInfoProcessed = logInfoProcessed.concat([
            {
              serverId: logInfo.server.id,
              wellId: logInfo.wellId,
              wellboreId: logInfo.wellboreId
            }
          ]);
        }
      }
    };
    getLogObjects();
  }, [logInfos, logObjects]);

  const updateSelectedRows = (rows: LogCurveInfoRow[]) => {
    if (selectedRows.length > 1) {
      const lastRowUnit = rows[0].unit;
      let isValid = true;
      for (const row of rows) {
        if (row.unit !== lastRowUnit) {
          isValid = false;
          break;
        }
      }
      setIsValid(isValid);
    }
    setSelectedRows(rows);
  };

  const columns: ContentTableColumn[] = useMemo(() => {
    return getColumns(
      isDepthIndex,
      false,
      false,
      undefined,
      logObjectMap,
      false
    );
  }, [isDepthIndex, logObjectMap]);

  const panelElements = [
    <CommonPanelContainer key="hideEmptyMnemonics">
      <Button onClick={() => onRemoveAll()}>Remove All</Button>
      <Button
        disabled={!selectedRows || selectedRows.length < 1}
        onClick={() => onRemoveSelected()}
      >
        Remove Selected
      </Button>
      {isDepthIndex ? (
        <AdjustDepthIndexRange
          minValue={GetStartIndex(isDepthIndex, selectedRows) as number}
          maxValue={GetEndIndex(isDepthIndex, selectedRows) as number}
          isDescending={false}
          onStartValueChanged={onStartIndexChange}
          onEndValueChanged={onEndIndexChange}
          onValidChange={setIsValid}
        />
      ) : (
        <AdjustDateTimeIndexRange
          minDate={GetStartIndex(isDepthIndex, selectedRows) as string}
          maxDate={GetEndIndex(isDepthIndex, selectedRows) as string}
          isDescending={false}
          onStartDateChanged={onStartIndexChange}
          onEndDateChanged={onEndIndexChange}
          onValidChange={setIsValid}
        />
      )}
      <Button
        disabled={!isValid || !selectedRows || selectedRows.length < 1}
        onClick={() => onShowValues(selectedRows)}
      >
        Show Values
      </Button>
    </CommonPanelContainer>
  ];

  return (
    <>
      {isFetchingLogs && <ProgressSpinnerOverlay message="Fetching Logs." />}
      {logCurveInfoList && (
        <ContentTable
          viewId={
            isDepthIndex
              ? "depthLogCurveInfoListView"
              : "timeLogCurveInfoListView"
          }
          panelElements={panelElements}
          columns={columns}
          data={getTableData(
            logObjects,
            logCurveInfoList,
            logObjectMap,
            undefined,
            timeZone,
            dateTimeFormat,
            curveThreshold,
            isDepthIndex
          )}
          checkableRows={true}
          // initiallySelectedRows={logCurveInfoRows}
          // onRowSelectionChange={onRowSelectionChange}
          onRowSelectionChange={(rows) =>
            updateSelectedRows(rows as LogCurveInfoRow[])
          }
          showRefresh
        />
      )}
    </>
  );
};

export default MultiLogCurveSelectionList;
