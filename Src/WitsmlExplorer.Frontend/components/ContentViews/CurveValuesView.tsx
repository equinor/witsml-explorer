import { Switch, Typography } from "@equinor/eds-core-react";
import { Button } from "@material-ui/core";
import orderBy from "lodash/orderBy";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import useExport from "../../hooks/useExport";
import {
  DeleteLogCurveValuesJob,
  IndexRange
} from "../../models/jobs/deleteLogCurveValuesJob";
import { CurveSpecification, LogData, LogDataRow } from "../../models/logData";
import LogObject, { indexToNumber } from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import LogObjectService from "../../services/logObjectService";
import {
  MILLIS_IN_SECOND,
  SECONDS_IN_MINUTE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "../Constants";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import MnemonicsContextMenu from "../ContextMenus/MnemonicsContextMenu";
import formatDateString from "../DateFormatter";
import ConfirmModal from "../Modals/ConfirmModal";
import ProgressSpinner from "../ProgressSpinner";
import { CurveValuesPlot } from "./CurveValuesPlot";
import EditNumber from "./EditNumber";
import EditSelectedLogCurveInfo from "./EditSelectedLogCurveInfo";
import { LogCurveInfoRow } from "./LogCurveInfoListView";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType,
  ExportableContentTableColumn,
  Order
} from "./table";

const TIME_INDEX_START_OFFSET = SECONDS_IN_MINUTE * 20; // offset before log end index that defines the start index for streaming (in seconds).
const DEPTH_INDEX_START_OFFSET = 20; // offset before log end index that defines the start index for streaming.
const TIME_INDEX_OFFSET = 30536000; // offset from current end index that should ensure that any new data is captured (in seconds).
const DEPTH_INDEX_OFFSET = 1000000; // offset from current end index that should ensure that any new data is captured.
const DEFAULT_REFRESH_DELAY = 5.0; // seconds
const AUTO_REFRESH_TIMEOUT = 5.0; // minutes

interface CurveValueRow extends LogDataRow, ContentTableRow {}

export const CurveValuesView = (): React.ReactElement => {
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const {
    selectedWell,
    selectedWellbore,
    selectedObject,
    selectedLogCurveInfo
  } = navigationState;
  const [columns, setColumns] = useState<
    ExportableContentTableColumn<CurveSpecification>[]
  >([]);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRows, setSelectedRows] = useState<CurveValueRow[]>([]);
  const [showPlot, setShowPlot] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshDelay, setRefreshDelay] = useState<number>(
    DEFAULT_REFRESH_DELAY
  );
  const [refreshFlag, setRefreshFlag] = useState<boolean>(null);
  const controller = useRef(new AbortController());
  const refreshDelayTimer = useRef<ReturnType<typeof setTimeout>>();
  const stopAutoRefreshTimer = useRef<ReturnType<typeof setTimeout>>();
  const selectedLog = selectedObject as LogObject;
  const { exportData, exportOptions } = useExport();

  const onRowSelectionChange = useCallback(
    (rows: CurveValueRow[]) => setSelectedRows(rows),
    []
  );

  useEffect(() => {
    if (refreshFlag != null && autoRefresh) {
      // Fetch new data (streaming)
      const startIndex = getCurrentMaxIndex();
      const endIndex = getOffsetIndex(
        startIndex,
        TIME_INDEX_OFFSET,
        DEPTH_INDEX_OFFSET
      );
      getLogData(startIndex, endIndex).then(() => {
        refreshDelayTimer.current = setTimeout(
          () => setRefreshFlag((flag) => !flag),
          refreshDelay * MILLIS_IN_SECOND
        );
      });
    }
  }, [refreshFlag]);

  useEffect(() => {
    if (autoRefresh) {
      setRefreshFlag((flag) => !flag);
      stopAutoRefreshTimer.current = setTimeout(
        stopAutoRefreshTimerCallback,
        AUTO_REFRESH_TIMEOUT * MILLIS_IN_SECOND * SECONDS_IN_MINUTE
      ); // Stop auto refresh after 5 minutes to reduce load on the server
    }

    return () => {
      if (refreshDelayTimer.current) clearTimeout(refreshDelayTimer.current);
      if (stopAutoRefreshTimer.current)
        clearTimeout(stopAutoRefreshTimer.current);
    };
  }, [autoRefresh]);

  const stopAutoRefreshTimerCallback = () => {
    setAutoRefresh(false);
    const confirmation = (
      <ConfirmModal
        heading={"Stream stopped"}
        content={
          <Typography>{`The log data stream was automatically stopped after ${AUTO_REFRESH_TIMEOUT} minutes to reduce the load on the server.`}</Typography>
        }
        onConfirm={() => {
          dispatchOperation({ type: OperationType.HideModal });
        }}
        confirmText={"OK"}
        showCancelButton={false}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const getDeleteLogCurveValuesJob = useCallback(
    (
      currentSelected: LogCurveInfoRow[],
      checkedContentItems: CurveValueRow[],
      selectedLog: LogObject,
      tableData: CurveValueRow[]
    ) => {
      const indexRanges = getIndexRanges(
        checkedContentItems,
        tableData,
        selectedLog
      );
      const mnemonics = currentSelected.map(
        (logCurveInfoRow) => logCurveInfoRow.mnemonic
      );

      const deleteLogCurveValuesJob: DeleteLogCurveValuesJob = {
        logReference: toObjectReference(selectedLog),
        mnemonics: mnemonics,
        indexRanges: indexRanges
      };
      return deleteLogCurveValuesJob;
    },
    [getIndexRanges, toObjectReference]
  );

  const exportSelectedIndexRange = useCallback(() => {
    const exportColumns = columns
      .map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`)
      .join(exportOptions.separator);
    const data = orderBy(tableData, getComparatorByColumn(columns[0]), [
      Order.Ascending,
      Order.Ascending
    ]) //Sorted because order is important when importing data
      .map((row) =>
        columns
          .map((col) => row[col.columnOf.mnemonic] as string)
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);
    exportData(
      `${selectedWellbore.name}-${selectedLog.name}`,
      exportColumns,
      data
    );
  }, [columns, tableData]);

  const exportSelectedDataPoints = useCallback(() => {
    const exportColumns = columns
      .map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`)
      .join(exportOptions.separator);
    const data = orderBy(selectedRows, getComparatorByColumn(columns[0]), [
      Order.Ascending,
      Order.Ascending
    ]) //Sorted because order is important when importing data
      .map((row) =>
        columns
          .map((col) => row[col.columnOf.mnemonic] as string)
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);
    exportData(
      `${selectedWellbore.name}-${selectedLog.name}`,
      exportColumns,
      data
    );
  }, [columns, selectedRows]);

  const onContextMenu = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement>,
      _: CurveValueRow,
      checkedContentItems: CurveValueRow[]
    ) => {
      const originalTableData = tableData.filter((data) =>
        checkedContentItems.map((c) => c.id).includes(data.id)
      );
      const deleteLogCurveValuesJob = getDeleteLogCurveValuesJob(
        selectedLogCurveInfo,
        originalTableData,
        selectedLog,
        tableData
      );
      const contextMenuProps = { deleteLogCurveValuesJob, dispatchOperation };
      const position = getContextMenuPosition(event);
      dispatchOperation({
        type: OperationType.DisplayContextMenu,
        payload: {
          component: <MnemonicsContextMenu {...contextMenuProps} />,
          position
        }
      });
    },
    [
      selectedLogCurveInfo,
      selectedLog,
      getDeleteLogCurveValuesJob,
      dispatchOperation,
      getContextMenuPosition,
      tableData
    ]
  );

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
    setTableData([]);
    setIsLoading(true);
    setAutoRefresh(false);

    if (selectedLogCurveInfo) {
      getLogData(
        String(selectedLogCurveInfo[0].minIndex),
        String(selectedLogCurveInfo[0].maxIndex)
      )
        .catch(truncateAbortHandler)
        .then(() => setIsLoading(false));
    }

    return () => controller.current?.abort();
  }, [selectedLogCurveInfo, selectedLog]);

  const onClickAutoRefresh = () => {
    if (autoRefresh) {
      setAutoRefresh(false);
    } else {
      // First fetch the latest data, then start streaming
      const isTimeLog = selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME;
      const currentEndIndex = isTimeLog
        ? selectedLog.endIndex
        : selectedLog.endIndex.replace(/[^0-9.]/g, "");
      const startIndex = getOffsetIndex(
        currentEndIndex,
        -TIME_INDEX_START_OFFSET,
        -DEPTH_INDEX_START_OFFSET
      );
      const endIndex = getOffsetIndex(
        currentEndIndex,
        TIME_INDEX_OFFSET,
        DEPTH_INDEX_OFFSET
      );
      getLogData(startIndex, endIndex).then(() => {
        setAutoRefresh(true);
      });
    }
  };

  const getCurrentMinIndex = (): string => {
    const indexCurve = selectedLog.indexCurve;
    const minIndex =
      tableData.length > 0 && indexCurve in tableData[0]
        ? tableData[0][indexCurve as keyof LogDataRow]
        : selectedLogCurveInfo[0].minIndex;
    return String(minIndex);
  };

  const getCurrentMaxIndex = (): string => {
    const indexCurve = selectedLog.indexCurve;
    const maxIndex =
      tableData.length > 0 && indexCurve in tableData[0]
        ? tableData.slice(-1)[0][indexCurve as keyof LogDataRow]
        : selectedLogCurveInfo[0].maxIndex;
    return String(maxIndex);
  };

  const getOffsetIndex = (
    baseIndex: string,
    timeOffset: number,
    depthOffset: number
  ) => {
    const isTimeLog = selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    const isDescending =
      selectedLog.direction == WITSML_LOG_ORDERTYPE_DECREASING;
    if (isTimeLog) {
      const endTime = new Date(baseIndex);
      endTime.setSeconds(
        endTime.getSeconds() + (isDescending ? -timeOffset : timeOffset)
      );
      return endTime.toISOString();
    } else {
      return String(+baseIndex + (isDescending ? -depthOffset : depthOffset));
    }
  };

  const getLogData = async (startIndex: string, endIndex: string) => {
    const mnemonics = selectedLogCurveInfo.map((lci) => lci.mnemonic);
    const startIndexIsInclusive = !autoRefresh;
    controller.current = new AbortController();

    const logData: LogData = await LogObjectService.getLogData(
      selectedWell.uid,
      selectedWellbore.uid,
      selectedLog.uid,
      mnemonics,
      startIndexIsInclusive,
      startIndex,
      endIndex,
      controller.current.signal
    );
    if (logData && logData.data) {
      updateColumns(logData.curveSpecifications);

      const logDataRows = logData.data.map((data) => {
        const row: CurveValueRow = {
          id: String(data[selectedLog.indexCurve]),
          ...data
        };
        return row;
      });
      if (autoRefresh && tableData.length > 0) {
        setTableData([...tableData, ...logDataRows]);
      } else {
        setTableData(logDataRows);
      }
    }
  };

  const panelElements = useMemo(
    () => [
      <Button
        key="downloadall"
        disabled={isLoading}
        onClick={() => exportSelectedIndexRange()}
      >
        Download all as .csv
      </Button>,
      <Button
        key="downloadselected"
        disabled={isLoading || !selectedRows.length}
        onClick={() => exportSelectedDataPoints()}
      >
        Download selected as .csv
      </Button>
    ],
    [
      isLoading,
      exportSelectedDataPoints,
      exportSelectedIndexRange,
      selectedRows
    ]
  );

  if (!selectedLog || !selectedLogCurveInfo) return null;
  return (
    <>
      <ContentContainer>
        <CommonPanelContainer>
          <EditSelectedLogCurveInfo
            disabled={autoRefresh}
            key="editSelectedLogCurveInfo"
            overrideStartIndex={autoRefresh ? getCurrentMinIndex() : null}
            overrideEndIndex={autoRefresh ? getCurrentMaxIndex() : null}
          />
          <Switch checked={showPlot} onChange={() => setShowPlot(!showPlot)} />
          <Typography>Show Plot</Typography>
          {selectedLog?.objectGrowing && (
            <>
              <Switch checked={autoRefresh} onChange={onClickAutoRefresh} />
              <Typography>Stream</Typography>
              {autoRefresh && (
                <EditNumber
                  defaultValue={refreshDelay}
                  label="Refresh Delay"
                  infoTooltip={
                    "Delay between refreshes in seconds.\nWarning: Setting a low value may strain the server."
                  }
                  infoIconColor={
                    refreshDelay < 2 ? colors.interactive.dangerResting : null
                  }
                  onSubmit={(value) => setRefreshDelay(value)}
                />
              )}
            </>
          )}
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
              name={selectedLog?.name}
              isDescending={
                selectedLog?.direction == WITSML_LOG_ORDERTYPE_DECREASING
              }
              autoRefresh={autoRefresh}
            />
          ) : (
            <ContentTable
              columns={columns}
              onRowSelectionChange={onRowSelectionChange}
              onContextMenu={onContextMenu}
              data={getTableData()}
              checkableRows={true}
              panelElements={panelElements}
              stickyLeftColumns={2}
              autoRefresh={autoRefresh}
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

const getIndexRanges = (
  checkedContentItems: CurveValueRow[],
  tableData: CurveValueRow[],
  selectedLog: LogObject
): IndexRange[] => {
  const sortedItems = checkedContentItems.sort((a, b) => {
    const idA =
      selectedLog.indexType === "datetime" ? new Date(a.id) : Number(a.id);
    const idB =
      selectedLog.indexType === "datetime" ? new Date(b.id) : Number(b.id);
    return idA < idB ? -1 : idA > idB ? 1 : 0;
  });
  const indexCurve = selectedLog.indexCurve;
  const idList = tableData.map((row) => String(row[indexCurve]));

  return sortedItems.reduce(
    (
      accumulator: IndexRange[],
      currentElement: CurveValueRow,
      currentIndex
    ) => {
      const indexValue = String(currentElement[indexCurve]);

      if (accumulator.length === 0) {
        accumulator.push({ startIndex: indexValue, endIndex: indexValue });
      } else {
        const prevElement = sortedItems[currentIndex - 1];
        const inSameRange =
          idList.indexOf(prevElement.id) ===
          idList.indexOf(currentElement.id) - 1;
        if (inSameRange) {
          accumulator[accumulator.length - 1].endIndex = indexValue;
        } else {
          accumulator.push({ startIndex: indexValue, endIndex: indexValue });
        }
      }
      return accumulator;
    },
    []
  );
};

const getComparatorByColumn = (
  column: ContentTableColumn
): [(row: any) => any, string] => {
  let comparator;
  switch (column.type) {
    case ContentType.Number:
      comparator = (row: any): number => Number(row[column.property]);
      break;
    case ContentType.Measure:
      comparator = (row: any): number =>
        Number(indexToNumber(row[column.property]));
      break;
    default:
      comparator = (row: any): string => row[column.property];
      break;
  }
  return [comparator, column.property];
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

export const CommonPanelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  > p {
    margin-left: -1rem;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
