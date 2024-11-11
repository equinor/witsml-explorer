import { EdsProvider, Switch, Typography } from "@equinor/eds-core-react";
import { WITSML_LOG_ORDERTYPE_DECREASING } from "components/Constants";
import { CurveValuesPlot } from "components/ContentViews/CurveValuesPlot";
import {
  ContentTable,
  ContentTableRow,
  ContentType,
  ExportableContentTableColumn
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import ProgressSpinner from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import { UserTheme } from "contexts/operationStateReducer";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { CurveSpecification, LogData, LogDataRow } from "models/logData";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { truncateAbortHandler } from "services/apiClient";
import LogObjectService from "services/logObjectService";
import styled from "styled-components";
import { getNameOccurrenceSuffix } from "tools/logSameNamesHelper";
import {
  CommonPanelContainer,
  ContentContainer
} from "../StyledComponents/Container";
import { normaliseThemeForEds } from "../../tools/themeHelpers.ts";

interface CurveValueRow extends LogDataRow, ContentTableRow {}

export const MultiLogCurveValuesView = (): React.ReactElement => {
  const {
    operationState: { timeZone, dateTimeFormat, theme }
  } = useOperationState();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mnemonicsSearchParams = searchParams.get("mnemonics");
  const startIndex = searchParams.get("startIndex");
  const endIndex = searchParams.get("endIndex");
  const { wellUid, wellboreUid, logType } = useParams();
  const [columns, setColumns] = useState<
    ExportableContentTableColumn<CurveSpecification>[]
  >([]);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPlot, setShowPlot] = useState<boolean>(false);
  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);
  const controller = useRef(new AbortController());
  const { connectedServer } = useConnectedServer();
  const {
    objects: allLogs,
    isFetching: isFetchingLogs,
    isFetched: isFetchedLogs
  } = useGetObjects(connectedServer, wellUid, wellboreUid, ObjectType.Log);

  const isFetching = isFetchingLogs;

  const updateColumns = (curveSpecifications: CurveSpecification[]) => {
    const newColumns = curveSpecifications.map((curveSpecification) => {
      return {
        columnOf: curveSpecification,
        property: curveSpecification.mnemonic,
        label: `${curveSpecification.mnemonic} (${curveSpecification.unit})`,
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

  useEffect(() => {
    refreshData();
    return () => controller.current?.abort();
  }, [startIndex, endIndex, allLogs]);

  const refreshData = () => {
    setTableData([]);
    setIsLoading(true);

    if (allLogs && !isFetching) {
      getLogData(startIndex, endIndex)
        .catch(truncateAbortHandler)
        .then(() => setIsLoading(false));
    }
  };

  const getLogMnemonics = () => {
    let logMnemonics: Record<string, string[]> = {};
    if (mnemonicsSearchParams) {
      logMnemonics = JSON.parse(mnemonicsSearchParams);
    } else if (location.state.mnemonics) {
      logMnemonics = JSON.parse(location.state.mnemonics);
    }
    return logMnemonics;
  };

  const getLogData = async (startIndex: string, endIndex: string) => {
    const logMnemonics = getLogMnemonics();
    const startIndexIsInclusive = true;
    controller.current = new AbortController();

    const logData: LogData = await LogObjectService.getMultiLogData(
      wellUid,
      wellboreUid,
      logMnemonics,
      startIndexIsInclusive,
      startIndex,
      endIndex,
      controller.current.signal
    );
    if (logData && logData.data) {
      const logDataWithProperNames = getLogDataWithProperNames(
        logData,
        allLogs
      );
      updateColumns(logDataWithProperNames.curveSpecifications);
      const indexCurve = logDataWithProperNames.curveSpecifications[0].mnemonic;

      const logDataRows = logDataWithProperNames.data.map((data) => {
        const row: CurveValueRow = {
          id: String(data[indexCurve]),
          ...data
        };
        return row;
      });
      setTableData(logDataRows);
    }
  };

  if (isFetching) {
    return <ProgressSpinner message="Fetching Log." />;
  }

  if (isFetchedLogs && !allLogs) {
    return <ItemNotFound itemType={ObjectType.Log} />;
  }

  return (
    <>
      <ContentContainer>
        <CommonPanelContainer>
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
        {isLoading && <ProgressSpinner message="Fetching data" />}
        {!isLoading && !tableData.length && (
          <Message>
            <Typography>No data</Typography>
          </Message>
        )}
        {Boolean(columns.length) &&
          Boolean(tableData.length) &&
          (showPlot ? (
            <CurveValuesPlot
              data={tableData}
              columns={columns}
              name={"Multiple Logs"}
              isDescending={
                allLogs?.[0].direction === WITSML_LOG_ORDERTYPE_DECREASING
              }
              autoRefresh={false}
            />
          ) : (
            <ContentTable
              columns={columns}
              data={getTableData()}
              checkableRows={true}
              stickyLeftColumns={2}
              autoRefresh={false}
            />
          ))}
      </ContentContainer>
    </>
  );
};
const Message = styled.div`
  margin: 10px;
  padding: 10px;
`;

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
  allLogs: LogObject[]
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
      mnemonic: newMnemonic
    };
  });

  return {
    ...logData,
    curveSpecifications: newCurveSpecifications,
    data: newData
  };
};
