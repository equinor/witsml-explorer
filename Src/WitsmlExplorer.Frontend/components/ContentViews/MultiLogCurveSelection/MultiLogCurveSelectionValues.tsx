import React, { useEffect, useState } from "react";
import {
  CommonPanelContainer,
  ContentContainer
} from "../../StyledComponents/Container.tsx";
import { normaliseThemeForEds } from "../../../tools/themeHelpers.ts";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import ProgressSpinner from "../../ProgressSpinner.tsx";
import { CurveValuesPlot } from "../CurveValuesPlot.tsx";
import { WITSML_LOG_ORDERTYPE_DECREASING } from "../../Constants.tsx";
import {
  ContentTable,
  ContentTableRow,
  ContentType,
  ExportableContentTableColumn
} from "../table";
import { EdsProvider, Switch, Typography } from "@equinor/eds-core-react";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import formatDateString from "../../DateFormatter.ts";
import {
  CurveSpecification,
  LogData,
  LogDataRow
} from "../../../models/logData.ts";
import LogObjectService from "../../../services/logObjectService.tsx";
import LogObject from "../../../models/logObject.tsx";
import { getNameOccurrenceSuffix } from "../../../tools/logSameNamesHelper.tsx";
import { LogCurveInfoRow } from "../LogCurveInfoListViewUtils.tsx";
import { Button } from "../../StyledComponents/Button.tsx";
import { Server } from "../../../models/server.ts";
import MultiLogCurveInfo from "../../../models/multilogCurveInfo.ts";
import { toDate } from "date-fns-tz";
import styled from "styled-components";

interface CurveValueRow extends LogDataRow, ContentTableRow {}

interface CurveSpecificationMultiLog extends CurveSpecification {
  server: Server;
}

interface MultiLogCurveSelectionValuesProps {
  multiLogCurveInfos: LogCurveInfoRow[];
  logObjects: LogObject[];
  logInfos: {
    server: Server;
    wellId: string;
    wellboreId: string;
    logId: string;
  }[];
  isDepthIndex: boolean;
  startIndex: string | number;
  endIndex: string | number;
  onSelectMnemonics: () => void;
}

const MultiLogCurveSelectionValues = (
  props: MultiLogCurveSelectionValuesProps
): React.ReactElement => {
  const {
    multiLogCurveInfos,
    logObjects,
    logInfos,
    isDepthIndex,
    startIndex,
    endIndex,
    onSelectMnemonics
  } = props;
  const {
    operationState: { timeZone, dateTimeFormat, theme }
  } = useOperationState();

  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [isFetchedData, setIsFetchedData] = useState<boolean>(false);

  const [showPlot, setShowPlot] = useState<boolean>(false);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [columns, setColumns] = useState<
    ExportableContentTableColumn<CurveSpecification>[]
  >([]);

  useEffect(() => {
    if (!isFetchedData && logInfos?.length > 0) {
      setIsFetchingData(true);

      let fetchingCount = logInfos.length;
      const logDatas: LogData[] = [];

      for (const logInfo of logInfos) {
        const mnemonics = multiLogCurveInfos.filter((lcir) => {
          const mlci = lcir.logCurveInfo as MultiLogCurveInfo;
          return (
            mlci.serverUrl == logInfo.server.url &&
            lcir.wellUid == logInfo.wellId &&
            lcir.wellboreUid == logInfo.wellboreId &&
            mlci.logUid == logInfo.logId
          );
        });

        if (mnemonics?.length > 0) {
          const logMnemonics: Record<string, string[]> = {
            [logInfo.logId]: mnemonics.map((mlci) => mlci.mnemonic)
          };

          LogObjectService.getMultiLogData(
            logInfo.wellId,
            logInfo.wellboreId,
            logMnemonics,
            true,
            startIndex.toString(),
            endIndex.toString(),
            new AbortController().signal,
            logInfo.server
          )
            .then((logData) => {
              if (logData?.data) {
                logDatas.push(
                  getLogDataWithProperNames(logData, logObjects, logInfo.server)
                );
              }
            })
            .finally(() => {
              fetchingCount--;
              if (fetchingCount < 1) {
                if (logDatas.length > 0) {
                  const curveSpecifications = [
                    ...logDatas[0].curveSpecifications
                  ];
                  const mainIndexCurve = curveSpecifications[0].mnemonic;
                  let totalIndexValues = logDatas[0].data.map(
                    (d) => d[mainIndexCurve]
                  );

                  for (let i = 1; i < logDatas.length; i++) {
                    const indexValues = logDatas[i].data.map(
                      (d) => d[logDatas[i].curveSpecifications[0].mnemonic]
                    );
                    const joinedIndexValues = isDepthIndex
                      ? totalIndexValues
                          .concat(indexValues)
                          .toSorted(
                            (iv1, iv2) => (iv1 as number) - (iv2 as number)
                          )
                      : totalIndexValues
                          .concat(indexValues)
                          .toSorted(
                            (iv1, iv2) =>
                              toDate(iv1 as string).getTime() -
                              toDate(iv2 as string).getTime()
                          );

                    const lastIndexValue = joinedIndexValues[0];
                    totalIndexValues = [joinedIndexValues[0]];
                    for (const indexValue of joinedIndexValues) {
                      if (indexValue !== lastIndexValue) {
                        totalIndexValues.push(indexValue);
                      }
                    }
                  }

                  for (let i = 1; i < logDatas.length; i++) {
                    curveSpecifications.push(
                      ...logDatas[i].curveSpecifications.slice(1)
                    );
                  }

                  updateColumns(curveSpecifications);

                  const logDataRows = [];

                  for (const indexValue of totalIndexValues) {
                    let data = {
                      id: String(indexValue),
                      [mainIndexCurve]: indexValue
                    };
                    for (const logData of logDatas) {
                      const logDataRow = logData.data.find(
                        (d) =>
                          d[logData.curveSpecifications[0].mnemonic] ===
                          indexValue
                      );

                      for (
                        let i = 1;
                        i < logData.curveSpecifications.length;
                        i++
                      ) {
                        data = {
                          ...data,
                          [logData.curveSpecifications[i].mnemonic]: logDataRow
                            ? logDataRow[
                                logData.curveSpecifications[i].mnemonic
                              ]
                            : undefined
                        };
                      }
                    }

                    logDataRows.push(data);
                  }

                  setTableData(logDataRows);
                }
                setIsFetchingData(false);
                setIsFetchedData(true);
              }
            });
        }
      }
    }
  }, [multiLogCurveInfos, logObjects, logInfos]);

  const updateColumns = (curveSpecifications: CurveSpecification[]) => {
    const newColumns = curveSpecifications.map((cs, idx) => {
      const curveSpecification = cs as CurveSpecificationMultiLog;
      return {
        columnOf: curveSpecification,
        property: curveSpecification.mnemonic,
        label:
          (idx === 0
            ? isDepthIndex
              ? "Depth"
              : "Time"
            : `[${curveSpecification.server.name}] ${curveSpecification.mnemonic}`) +
          `(${curveSpecification.unit})`,
        type: getColumnType(curveSpecification)
      };
    });
    const prevMnemonics = columns.map((column) => column.property);
    const newMnemonics = newColumns.map((column) => column.property);
    if (
      prevMnemonics.length !== newMnemonics.length ||
      prevMnemonics.some((value, index) => value !== newMnemonics[index])
    ) {
      setColumns(newColumns);
    }
  };

  const getColumnType = (curveSpecification: CurveSpecification) => {
    const isTimeMnemonic = (mnemonic: string) =>
      ["time", "datetime", "date time"].indexOf(mnemonic.toLowerCase()) >= 0;
    if (isTimeMnemonic(curveSpecification.mnemonic)) {
      return ContentType.DateTime;
    }
    switch (curveSpecification.unit.toLowerCase()) {
      case "time":
      case "datetime":
        return ContentType.DateTime;
      case "unitless":
        return ContentType.String;
      default:
        return ContentType.Number;
    }
  };

  const getLogDataWithProperNames = (
    logData: LogData,
    allLogs: LogObject[],
    server: Server
  ): LogData => {
    const uidRegex = /\[uid=(.*?)\]/; // Matches on [uid=<...>]

    const newData = logData.data.map((row: LogDataRow) => {
      const newRow: LogDataRow = {};
      for (const key in row) {
        if (uidRegex.test(key)) {
          const match = key.match(uidRegex);
          const uid = match[1];
          const log = allLogs.find((log) => log.uid === uid);
          const newKey = key.replace(
            uidRegex,
            ` - ${log.name}${getNameOccurrenceSuffix(allLogs, log)}`
          );
          newRow[newKey] = row[key];
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });

    const newCurveSpecifications = logData.curveSpecifications.map((spec) => {
      const match = spec.mnemonic.match(uidRegex);
      const uid = match ? match[1] : null;
      let newMnemonic = spec.mnemonic;
      if (uid) {
        const log = allLogs.find((log) => log.uid === uid);
        newMnemonic = spec.mnemonic.replace(
          uidRegex,
          ` - ${log.name}${getNameOccurrenceSuffix(allLogs, log)}`
        );
      }
      return {
        ...spec,
        mnemonic: newMnemonic,
        server: server
      };
    });

    return {
      ...logData,
      curveSpecifications: newCurveSpecifications,
      data: newData
    };
  };

  const getTableData = React.useCallback(() => {
    const mnemonicToType = Object.fromEntries(
      columns.map((c) => [c.property, c.type])
    );
    return tableData.map((data) => {
      return Object.entries(data).reduce((newData, [key, value]) => {
        newData[key] =
          mnemonicToType[key] === ContentType.DateTime
            ? formatDateString(value as string, timeZone, dateTimeFormat)
            : value;
        return newData;
      }, {} as CurveValueRow);
    });
  }, [tableData, columns, timeZone, dateTimeFormat]);

  return (
    <>
      <ContentContainer>
        <CommonPanelContainer key="selectMnemonics">
          <Button onClick={() => onSelectMnemonics()}>Select Mnemonics</Button>
        </CommonPanelContainer>
        <CommonPanelContainer key="showPlot">
          <EdsProvider density={normaliseThemeForEds(theme)}>
            <Switch
              checked={showPlot}
              onChange={() => setShowPlot(!showPlot)}
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <Typography style={{ minWidth: "max-content" }}>
              Show Plot
            </Typography>
          </EdsProvider>
        </CommonPanelContainer>
        {isFetchingData ? (
          <ProgressSpinner message="Fetching data" />
        ) : showPlot ? (
          <CurveValuesPlotContainer>
            <CurveValuesPlot
              data={tableData}
              columns={columns}
              name={"Multiple Logs"}
              isDescending={
                logObjects?.[0].direction === WITSML_LOG_ORDERTYPE_DECREASING
              }
              autoRefresh={false}
            />
          </CurveValuesPlotContainer>
        ) : (
          <ContentTable
            columns={columns}
            data={getTableData()}
            checkableRows={false}
            stickyLeftColumns={2}
            autoRefresh={false}
          />
        )}
      </ContentContainer>
    </>
  );
};

export const CurveValuesPlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

// const Message = styled.div`
//   margin: 10px;
//   padding: 10px;
// `;

export default MultiLogCurveSelectionValues;
