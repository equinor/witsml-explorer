import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommonPanelContainer,
  ContentContainer
} from "../../StyledComponents/Container.tsx";
import { normaliseThemeForEds } from "../../../tools/themeHelpers.ts";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";
import ProgressSpinner from "../../ProgressSpinner.tsx";
import { CurveValuesPlot } from "../CurveValuesPlot.tsx";
import {
  ContentTable,
  ContentTableRow,
  ContentType,
  ExportableContentTableColumn
} from "../table";
import { EdsProvider, Icon, Switch, Typography } from "@equinor/eds-core-react";
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
import { MultiLogMetadata } from "../../MultiLogUtils.tsx";
import { RouterLogType } from "../../../routes/routerConstants.ts";
import randomColor from "randomcolor";
import { Colors, dark } from "../../../styles/Colors.tsx";
import AdjustDepthIndexRange from "../../Modals/TrimLogObject/AdjustDepthIndexRange.tsx";
import AdjustDateTimeIndexRange from "../../Modals/TrimLogObject/AdjustDateTimeIndexRange.tsx";

interface CurveValueRow extends LogDataRow, ContentTableRow {}

interface CurveSpecificationMultiLog extends CurveSpecification {
  server: Server;
  logObject: LogObject;
}

interface MultiLogCurveSelectionValuesProps {
  multiLogCurveInfoRows: LogCurveInfoRow[];
  logObjects: LogObject[];
  multiLogMetadatas: MultiLogMetadata[];
  isDepthIndex: boolean;
  startIndex: string | number;
  endIndex: string | number;
  onSelectMnemonics: () => void;
}

const MultiLogCurveSelectionValues = (
  props: MultiLogCurveSelectionValuesProps
): React.ReactElement => {
  const {
    multiLogCurveInfoRows,
    logObjects,
    multiLogMetadatas,
    isDepthIndex,
    startIndex,
    endIndex,
    onSelectMnemonics
  } = props;
  const {
    operationState: { timeZone, dateTimeFormat, theme, colors }
  } = useOperationState();

  const [startIndexValue, setStartIndexValue] = useState<string | number>(
    startIndex
  );
  const [endIndexValue, setEndIndexValue] = useState<string | number>(endIndex);

  const [isValidIndexRange, setIsValidIndexRange] = useState<boolean>(true);

  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  const [showPlot, setShowPlot] = useState<boolean>(false);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [tableColumns, setTableColumns] = useState<
    ExportableContentTableColumn<CurveSpecification>[]
  >([]);
  const [plotColumns, setPlotColumns] = useState<
    ExportableContentTableColumn<CurveSpecification>[]
  >([]);

  const usedServers = useMemo(() => {
    return multiLogMetadatas
      .map((md) => md.server)
      .filter(
        (s, idx) =>
          multiLogMetadatas.findIndex((m) => m.server.id === s.id) === idx
      )
      .sort((s1, s2) => s1.name.localeCompare(s2.name));
  }, [multiLogMetadatas]);

  const colorPalette: string[] = [
    "#d87c7c",
    "#919e8b",
    "#d7ab82",
    "#6e7074",
    "#61a0a8",
    "#efa18d",
    "#787464",
    "#cc7e63",
    "#724e58",
    "#4b565b"
  ];

  const serverColors = useMemo(() => {
    const serverColorMap: { [idServer: string]: Colors } = {};

    for (let i = 0; i < usedServers.length; i++) {
      const colorsCopy = {
        mode: colors.mode,
        infographic: { ...colors.infographic },
        interactive: { ...colors.interactive },
        text: { ...colors.text },
        ui: { ...colors.ui }
      } as Colors;

      colorsCopy.interactive.tableHeaderFillResting =
        i <= colorPalette.length
          ? colorPalette[i]
          : randomColor({
              luminosity: "dark",
              hue: colorPalette[i % colorPalette.length]
            });

      serverColorMap[usedServers[i].id] = colorsCopy;
    }

    return serverColorMap;
  }, [usedServers]);

  const setupData = useCallback(async () => {
    let curveSpecifications: CurveSpecification[] = [];
    const logDataRows = [];

    if (multiLogMetadatas?.length > 0) {
      setIsFetchingData(true);

      const logDatas: LogData[] = [];

      for (const logInfo of multiLogMetadatas) {
        const mnemonics = multiLogCurveInfoRows.filter((lcir) => {
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

          const logData = await LogObjectService.getMultiLogData(
            logInfo.wellId,
            logInfo.wellboreId,
            logMnemonics,
            true,
            startIndexValue.toString(),
            endIndexValue.toString(),
            new AbortController().signal,
            logInfo.server
          );

          if (logData?.data) {
            logDatas.push(
              getLogDataWithProperNames(logData, logObjects, logInfo.server)
            );
          }
        }
      }

      if (logDatas.length > 0) {
        curveSpecifications = [logDatas[0].curveSpecifications[0]];
        const mainIndexCurve = curveSpecifications[0].mnemonic;

        let mnemonicCurveSpecifications: CurveSpecification[] = [];
        for (let i = 0; i < logDatas.length; i++) {
          mnemonicCurveSpecifications = mnemonicCurveSpecifications.concat(
            logDatas[i].curveSpecifications.slice(1)
          );
        }

        curveSpecifications = curveSpecifications.concat(
          mnemonicCurveSpecifications.toSorted((m1, m2) =>
            m1.mnemonic.localeCompare(m2.mnemonic)
          )
        );

        let joinedIndexValues: (string | number | boolean)[] =
          logDatas[0].data.map((d) => d[mainIndexCurve]);

        for (let i = 1; i < logDatas.length; i++) {
          const indexValues = logDatas[i].data.map(
            (d) => d[logDatas[i].curveSpecifications[0].mnemonic]
          );
          joinedIndexValues = joinedIndexValues.concat(indexValues);
        }

        joinedIndexValues = isDepthIndex
          ? joinedIndexValues.toSorted(
              (iv1, iv2) => (iv1 as number) - (iv2 as number)
            )
          : joinedIndexValues.toSorted(
              (iv1, iv2) =>
                toDate(iv1 as string).getTime() -
                toDate(iv2 as string).getTime()
            );

        const lastIndexValue = joinedIndexValues[0];
        const totalIndexValues = [joinedIndexValues[0]];
        for (const indexValue of joinedIndexValues) {
          if (indexValue !== lastIndexValue) {
            totalIndexValues.push(indexValue);
          }
        }

        for (const indexValue of totalIndexValues) {
          let data = {
            id: String(indexValue),
            [mainIndexCurve]: indexValue
          };

          for (const logData of logDatas) {
            const logDataRow = logData.data.find(
              (d) => d[logData.curveSpecifications[0].mnemonic] === indexValue
            );

            for (let i = 1; i < logData.curveSpecifications.length; i++) {
              data = {
                ...data,
                [logData.curveSpecifications[i].mnemonic]: logDataRow
                  ? logDataRow[logData.curveSpecifications[i].mnemonic]
                  : undefined
              };
            }
          }

          logDataRows.push(data);
        }
      }
    }

    updateColumns(curveSpecifications);
    setTableData(logDataRows);
    setIsFetchingData(false);
  }, [startIndexValue, endIndexValue]);

  useEffect(() => {
    setupData();
  }, []);

  const onRefresh = async () => {
    await setupData();
  };

  const updateColumns = (curveSpecifications: CurveSpecification[]) => {
    if (curveSpecifications?.length > 0) {
      setTableColumns(
        curveSpecifications.map((cs, idx) => {
          const curveSpecification = cs as CurveSpecificationMultiLog;
          // @ts-ignore
          return {
            columnOf: curveSpecification,
            property: curveSpecification.mnemonic,
            label:
              (idx === 0
                ? isDepthIndex
                  ? "Depth"
                  : "Time"
                : `${curveSpecification.mnemonic}`) +
              ` (${curveSpecification.unit})`,
            type: getColumnType(curveSpecification),
            headerColors:
              idx > 0 ? serverColors[curveSpecification.server.id] : undefined,
            headerTooltip: curveSpecification.logObject ? (
              <>
                <Typography>
                  Well: {curveSpecification.logObject.wellName}
                </Typography>
                <Typography>
                  Wellbore: {curveSpecification.logObject.wellboreName}
                </Typography>
                <Typography>
                  Log: {curveSpecification.logObject.name}
                </Typography>
              </>
            ) : undefined
          } as ExportableContentTableColumn<CurveSpecification>;
        })
      );

      setPlotColumns(
        curveSpecifications.map((cs, idx) => {
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
              ` (${curveSpecification.unit})`,
            type: getColumnType(curveSpecification)
          } as ExportableContentTableColumn<CurveSpecification>;
        })
      );
    } else {
      setTableColumns([]);
      setPlotColumns([]);
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
      let logObject: LogObject = undefined;
      if (uid) {
        logObject = allLogs.find((log) => log.uid === uid);
        newMnemonic = spec.mnemonic.replace(
          uidRegex,
          ` - ${logObject.name}${getNameOccurrenceSuffix(allLogs, logObject)}`
        );
      }
      return {
        ...spec,
        mnemonic: newMnemonic,
        server: server,
        logObject: logObject
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
      tableColumns.map((c) => [c.property, c.type])
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
  }, [tableData, tableColumns, timeZone, dateTimeFormat]);

  const panelElements = [
    <CommonPanelContainer key="legend">
      <Typography>Legend:</Typography>
      <Legend>
        {usedServers.map((usedServer) => (
          <LegendItem key={usedServer.id}>
            <LegendIcon colors={serverColors[usedServer.id]}></LegendIcon>
            <Typography>&nbsp;=&nbsp;{usedServer.name}</Typography>
          </LegendItem>
        ))}
      </Legend>
    </CommonPanelContainer>
  ];

  return (
    <StyledContentContainer colors={colors}>
      <HeaderContent>
        <CommonPanelContainer key="selectMnemonics">
          <Button onClick={() => onSelectMnemonics()}>
            <Icon name="arrowBack" />
            Select Mnemonics
          </Button>
        </CommonPanelContainer>
        <CommonPanelContainer key="selectIndexRange">
          {isDepthIndex ? (
            <AdjustDepthIndexRange
              minValue={startIndex as number}
              maxValue={endIndex as number}
              isDescending={false}
              hideSetButtons={true}
              onStartValueChanged={setStartIndexValue}
              onEndValueChanged={setEndIndexValue}
              onValidChange={setIsValidIndexRange}
            />
          ) : (
            <AdjustDateTimeIndexRange
              minDate={startIndex as string}
              maxDate={endIndex as string}
              isDescending={false}
              hideSetButtons={true}
              onStartDateChanged={setStartIndexValue}
              onEndDateChanged={setEndIndexValue}
              onValidChange={setIsValidIndexRange}
            />
          )}
        </CommonPanelContainer>
        <CommonPanelContainer key="refreshPanel">
          <Button
            aria-label="refresh"
            variant="ghost_icon"
            key="refreshObjects"
            onClick={onRefresh}
            disabled={!isValidIndexRange}
          >
            <Icon name="refresh" />
          </Button>
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
      </HeaderContent>
      {isFetchingData ? (
        <ProgressSpinner message="Fetching data" />
      ) : showPlot ? (
        <CurveValuesPlotContainer>
          <CurveValuesPlot
            data={tableData}
            columns={plotColumns}
            name={"Multiple Logs"}
            isDescending={true}
            autoRefresh={false}
            routerLogType={
              isDepthIndex ? RouterLogType.DEPTH : RouterLogType.TIME
            }
          />
        </CurveValuesPlotContainer>
      ) : (
        <ContentTable
          panelElements={panelElements}
          columns={tableColumns}
          data={getTableData()}
          checkableRows={false}
          stickyLeftColumns={1}
          autoRefresh={false}
        />
      )}
    </StyledContentContainer>
  );
};

export const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 0px 0px 5px;
`;

export const Legend = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
`;

export const LegendItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding-left: 10px;
`;

export const LegendIcon = styled.div<{ colors: Colors }>`
  height: 1.25rem;
  width: 2.5rem;
  background-color: ${(props) =>
    props.colors.interactive.tableHeaderFillResting};
`;

export const CurveValuesPlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const StyledContentContainer = styled(ContentContainer)<{
  colors: Colors;
}>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  color: ${(props) => props.colors.text.staticIconsDefault};

  div[class*="InputWrapper__Container"] {
    label {
      color: ${(props) => props.colors.text.staticTextLabel};
    }
  }

  div[class*="Input__Container"][disabled] {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
    border-bottom: 1px solid #575d63;
  }

  div[class*="Input__Container"] {
    background-color: ${(props) => props.colors.text.staticTextFieldDefault};
  }

  div[class*="DateTimeField__Layout"] {
    svg {
      fill: ${(props) => props.colors.text.staticIconsDefault};
    }

    label {
      color: ${(props) => props.colors.text.staticIconsDefault};
    }
  }

  input[type="datetime-local"] {
    color-scheme: ${({ colors }) => (colors === dark ? "dark" : "")};
  }

  ${({ colors }) =>
    colors === dark
      ? `
      button[disabled]:disabled {
        background: #565656;
        border:1px solid #565656;
        color:#9CA6AC;
      }
      button[class*="Autocomplete__StyledButton"]:disabled {
        background: none;
        border: none;
      }
      `
      : ""};
`;

export default MultiLogCurveSelectionValues;
