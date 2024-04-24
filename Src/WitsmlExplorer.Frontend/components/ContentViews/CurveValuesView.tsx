import {
  EdsProvider,
  Radio,
  Switch,
  Typography
} from "@equinor/eds-core-react";
import {
  MILLIS_IN_SECOND,
  SECONDS_IN_MINUTE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import { CurveValuesPlot } from "components/ContentViews/CurveValuesPlot";
import EditNumber from "components/ContentViews/EditNumber";
import EditSelectedLogCurveInfo from "components/ContentViews/EditSelectedLogCurveInfo";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType,
  ExportableContentTableColumn,
  Order
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import MnemonicsContextMenu from "components/ContextMenus/MnemonicsContextMenu";
import formatDateString from "components/DateFormatter";
import ConfirmModal from "components/Modals/ConfirmModal";
import { ReportModal } from "components/Modals/ReportModal";
import { ShowLogDataOnServerModal } from "components/Modals/ShowLogDataOnServerModal";
import ProgressSpinner from "components/ProgressSpinner";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { DispatchOperation, UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import useExport from "hooks/useExport";
import { useGetMnemonics } from "hooks/useGetMnemonics";
import orderBy from "lodash/orderBy";
import { ComponentType } from "models/componentType";
import {
  DeleteLogCurveValuesJob,
  IndexRange
} from "models/jobs/deleteLogCurveValuesJob";
import DownloadAllLogDataJob from "models/jobs/downloadAllLogDataJob";
import {
  CurveSpecification,
  LogData,
  LogDataRequestQuery,
  LogDataRow
} from "models/logData";
import LogObject, { indexToNumber } from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  createSearchParams,
  useParams,
  useSearchParams
} from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { truncateAbortHandler } from "services/apiClient";
import JobService, { JobType } from "services/jobService";
import LogObjectService from "services/logObjectService";
import styled from "styled-components";
import Icon from "styles/Icons";
import { formatIndexValue } from "tools/IndexHelpers";
import {
  CommonPanelContainer,
  ContentContainer
} from "../StyledComponents/Container";

const TIME_INDEX_START_OFFSET = SECONDS_IN_MINUTE * 20; // offset before log end index that defines the start index for streaming (in seconds).
const DEPTH_INDEX_START_OFFSET = 20; // offset before log end index that defines the start index for streaming.
const TIME_INDEX_OFFSET = 30536000; // offset from current end index that should ensure that any new data is captured (in seconds).
const DEPTH_INDEX_OFFSET = 1000000; // offset from current end index that should ensure that any new data is captured.
const DEFAULT_REFRESH_DELAY = 5.0; // seconds
const AUTO_REFRESH_TIMEOUT = 5.0; // minutes

interface CurveValueRow extends LogDataRow, ContentTableRow {}

enum DownloadOptions {
  All = "All",
  IntervalOfData = "IntervalOfData",
  SelectedIndexValues = "SelectedIndexValues"
}

export const CurveValuesView = (): React.ReactElement => {
  const {
    operationState: { timeZone, dateTimeFormat, colors, theme },
    dispatchOperation
  } = useContext(OperationContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const mnemonicsSearchParams = searchParams.get("mnemonics");
  const startIndex = searchParams.get("startIndex");
  const endIndex = searchParams.get("endIndex");
  const { wellUid, wellboreUid, objectUid, logType } = useParams();
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
  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);
  const controller = useRef(new AbortController());
  const refreshDelayTimer = useRef<ReturnType<typeof setTimeout>>();
  const stopAutoRefreshTimer = useRef<ReturnType<typeof setTimeout>>();
  const { connectedServer } = useConnectedServer();
  const {
    object: log,
    isFetching: isFetchingLog,
    isFetched: isFetchedLog
  } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log,
    objectUid
  );
  const { exportData, exportOptions } = useExport();
  const justFinishedStreaming = useRef(false);
  let downloadOptions: DownloadOptions = DownloadOptions.IntervalOfData;
  const { components: logCurveInfoList, isFetching: isFetchingLogCurveInfo } =
    useGetComponents(
      connectedServer,
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.Mnemonic
    );
  const isFetching = isFetchingLog || isFetchingLogCurveInfo;

  const { mnemonics } = useGetMnemonics(
    isFetching,
    logCurveInfoList,
    mnemonicsSearchParams,
    true
  );

  const onChangeDownloadOption = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedValue = event.target.value;
    const enumToString = selectedValue as DownloadOptions;
    downloadOptions = enumToString;
  };

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
    justFinishedStreaming.current = true;
    setAutoRefresh(false);
    updateSearchParamsAfterStreaming();
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
      mnemonics: string[],
      checkedContentItems: CurveValueRow[],
      selectedLog: LogObject,
      tableData: CurveValueRow[]
    ) => {
      const indexRanges = getIndexRanges(
        checkedContentItems,
        tableData,
        selectedLog
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

  const executeExport = () => {
    switch (downloadOptions) {
      case DownloadOptions.All:
        exportAll();
        break;
      case DownloadOptions.IntervalOfData:
        exportSelectedIndexRange();
        break;
      case DownloadOptions.SelectedIndexValues:
        exportSelectedDataPoints();
    }
    downloadOptions = DownloadOptions.IntervalOfData;
  };

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
    exportData(log.name, exportColumns, data);
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
    exportData(log.name, exportColumns, data);
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
        mnemonics,
        originalTableData,
        log,
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
      mnemonics,
      log,
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
    if (!justFinishedStreaming.current) {
      // This is to prevent refreshing after the search params has been updated after the steam is stopped.
      refreshData();
    } else {
      justFinishedStreaming.current = false;
    }
    return () => controller.current?.abort();
  }, [startIndex, endIndex, mnemonics, log]);

  const refreshData = () => {
    setTableData([]);
    setIsLoading(true);
    setAutoRefresh(false);

    if (log && !isFetching && mnemonics) {
      getLogData(startIndex, endIndex)
        .catch(truncateAbortHandler)
        .then(() => setIsLoading(false));
    }
  };

  const updateSearchParamsAfterStreaming = () => {
    const newSearchParams = createSearchParams({
      mnemonics: JSON.stringify(mnemonics),
      startIndex: formatIndexValue(getCurrentMinIndex()),
      endIndex: formatIndexValue(getCurrentMaxIndex())
    });
    setSearchParams(newSearchParams);
  };

  const onClickAutoRefresh = () => {
    if (autoRefresh) {
      justFinishedStreaming.current = true;
      setAutoRefresh(false);
      updateSearchParamsAfterStreaming();
    } else {
      // First fetch the latest data, then start streaming
      const isTimeLog = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
      const currentEndIndex = isTimeLog
        ? log.endIndex
        : log.endIndex.replace(/[^0-9.]/g, "");
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
    const indexCurve = log.indexCurve;
    const minIndex =
      tableData.length > 0 && indexCurve in tableData[0]
        ? tableData[0][indexCurve as keyof LogDataRow]
        : startIndex;
    return String(minIndex);
  };

  const getCurrentMaxIndex = (): string => {
    const indexCurve = log.indexCurve;
    const maxIndex =
      tableData.length > 0 && indexCurve in tableData[0]
        ? tableData.slice(-1)[0][indexCurve as keyof LogDataRow]
        : endIndex;
    return String(maxIndex);
  };

  const getOffsetIndex = (
    baseIndex: string,
    timeOffset: number,
    depthOffset: number
  ) => {
    const isTimeLog = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    const isDescending = log.direction == WITSML_LOG_ORDERTYPE_DECREASING;
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

  const exportAll = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logReference: LogObject = log;
    const startIndexIsInclusive = !autoRefresh;
    const downloadAllLogDataJob: DownloadAllLogDataJob = {
      logReference,
      mnemonics,
      startIndexIsInclusive
    };
    const jobId = await JobService.orderJob(
      JobType.DownloadAllLogData,
      downloadAllLogDataJob
    );
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const displayConfirmation = (dispatchOperation: DispatchOperation) => {
    const confirmation = (
      <ConfirmModal
        heading={"Download"}
        content={
          <>
            <span>
              <Typography>Choose download option?</Typography>
            </span>

            <label style={alignLayout}>
              <Radio
                name="group"
                value={DownloadOptions.IntervalOfData}
                id={DownloadOptions.IntervalOfData}
                onChange={onChangeDownloadOption}
                defaultChecked
              />
              <Typography>Download shown interval</Typography>
            </label>
            <label style={alignLayout}>
              <Radio
                name="group"
                id={DownloadOptions.SelectedIndexValues}
                value={DownloadOptions.SelectedIndexValues}
                onChange={onChangeDownloadOption}
                disabled={!selectedRows.length}
              />
              <Typography>Download selected</Typography>
            </label>
            <label style={alignLayout}>
              <Radio
                name="group"
                id={DownloadOptions.All}
                value={DownloadOptions.All}
                onChange={onChangeDownloadOption}
              />
              <Typography>Download all data</Typography>
            </label>
          </>
        }
        onConfirm={() => {
          dispatchOperation({ type: OperationType.HideModal });
          executeExport();
        }}
        confirmText={"OK"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const getLogData = async (startIndex: string, endIndex: string) => {
    const startIndexIsInclusive = !autoRefresh;
    controller.current = new AbortController();
    const logDataObjectQuery = new LogDataRequestQuery(objectUid, mnemonics);
    const payLoad = [logDataObjectQuery];

    const logData: LogData = await LogObjectService.getLogData(
      wellUid,
      wellboreUid,
      payLoad,
      startIndexIsInclusive,
      startIndex,
      endIndex,
      false,
      controller.current.signal
    );
    if (logData && logData.data) {
      updateColumns(logData.curveSpecifications);

      const logDataRows = logData.data.map((data) => {
        const row: CurveValueRow = {
          id: String(data[log.indexCurve]),
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
        variant="ghost_icon"
        disabled={isLoading}
        onClick={() => displayConfirmation(dispatchOperation)}
      >
        <Icon name="download" />
      </Button>,
      <Button
        key="showLogDataOnServer"
        disabled={isLoading || isFetching}
        onClick={() =>
          dispatchOperation({
            type: OperationType.DisplayModal,
            payload: <ShowLogDataOnServerModal />
          })
        }
      >
        Show on server
      </Button>
    ],
    [
      isLoading,
      exportSelectedDataPoints,
      exportSelectedIndexRange,
      selectedRows,
      colors.mode,
      theme
    ]
  );

  if (isFetching) {
    return <ProgressSpinner message="Fetching Log." />;
  }

  if (isFetchedLog && !log) {
    return <ItemNotFound itemType={ObjectType.Log} />;
  }

  return (
    <>
      <ContentContainer>
        <CommonPanelContainer>
          <EditSelectedLogCurveInfo
            disabled={autoRefresh}
            key="editSelectedLogCurveInfo"
            overrideStartIndex={autoRefresh ? getCurrentMinIndex() : null}
            overrideEndIndex={autoRefresh ? getCurrentMaxIndex() : null}
            onClickRefresh={() => refreshData()}
          />
          <EdsProvider density={theme}>
            <Switch
              checked={showPlot}
              onChange={() => setShowPlot(!showPlot)}
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <Typography style={{ minWidth: "max-content" }}>
              Show Plot
            </Typography>
          </EdsProvider>
          {log?.objectGrowing && (
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
              name={log?.name}
              isDescending={log?.direction == WITSML_LOG_ORDERTYPE_DECREASING}
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

const alignLayout: CSSProperties = {
  display: "flex",
  alignItems: "center"
};
