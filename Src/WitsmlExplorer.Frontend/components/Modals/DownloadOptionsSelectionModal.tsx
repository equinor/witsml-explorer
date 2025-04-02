import { Radio, Typography } from "@equinor/eds-core-react";
import { CurveValueRow } from "components/ContentViews/CurveValuesView";
import {
  ContentTableColumn,
  ContentType,
  ExportableContentTableColumn,
  Order
} from "components/ContentViews/table";
import OperationType from "contexts/operationType";
import useExport from "hooks/useExport";
import { useOperationState } from "hooks/useOperationState";
import orderBy from "lodash/orderBy";
import DownloadLogDataJob from "models/jobs/downloadLogDataJob";
import { CurveSpecification } from "models/logData";
import LogObject, { indexToNumber } from "models/logObject";
import React, { CSSProperties, useCallback, useState } from "react";
import JobService, { JobType } from "services/jobService";
import ConfirmModal from "./ConfirmModal";
import { ReportModal } from "./ReportModal";
import { RouterLogType } from "routes/routerConstants";
import { useParams } from "react-router-dom";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import WarningBar from "components/WarningBar";

export interface DownloadOptionsSelectionModalProps {
  mnemonics: string[];
  selectedRows: CurveValueRow[];
  log: LogObject;
  startIndex: string;
  endIndex: string;
  columns: ExportableContentTableColumn<CurveSpecification>[];
  curveValueRows: CurveValueRow[];
  autoRefresh: boolean;
}

enum DownloadOptions {
  All = "All",
  SelectedRange = "SelectedRange",
  SelectedIndexValues = "SelectedIndexValues"
}

enum DownloadFormat {
  Csv = "Csv",
  Las = "Las"
}

const DownloadOptionsSelectionModal = (
  props: DownloadOptionsSelectionModalProps
): React.ReactElement => {
  const { dispatchOperation } = useOperationState();
  const [selectedDownloadOption, setSelectedDownloadOption] =
    useState<DownloadOptions>(DownloadOptions.SelectedRange);

  const [selectedDownloadFormat, setSelectedDownloadFormat] =
    useState<DownloadFormat>(DownloadFormat.Csv);
  const { exportData, exportOptions } = useExport();

  const { logType } = useParams();

  const { log, curveValueRows } = props;

  const getStartIndex = (log: LogObject): string | number => {
    const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    if (selectedDownloadOption === DownloadOptions.All) {
      return isTimeIndexed ? log.startIndex : indexToNumber(log.startIndex);
    }
    if (selectedDownloadOption === DownloadOptions.SelectedRange) {
      return isTimeIndexed ? props.startIndex : indexToNumber(props.startIndex);
    }
  };

  const getEndIndex = (log: LogObject): string | number => {
    const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    if (selectedDownloadOption === DownloadOptions.All) {
      return isTimeIndexed ? log.endIndex : indexToNumber(log.endIndex);
    }
    if (selectedDownloadOption === DownloadOptions.SelectedRange) {
      return isTimeIndexed ? props.endIndex : indexToNumber(props.endIndex);
    }
  };

  const isTimeLog = logType === RouterLogType.TIME;

  const [startIndex, setStartIndex] = useState<string | number>(
    getStartIndex(log)
  );
  const [endIndex, setEndIndex] = useState<string | number>(getEndIndex(log));

  const [isValidInterval, setIsValidInterval] = useState<boolean>(true);

  const exportSelectedRange = async () => {
    const logReference: LogObject = props.log;
    const startIndexIsInclusive = !props.autoRefresh;
    const exportToLas = selectedDownloadFormat === DownloadFormat.Las;
    const downloadLogDataJob: DownloadLogDataJob = {
      logReference,
      mnemonics: props.mnemonics,
      startIndexIsInclusive,
      exportToLas,
      startIndex: startIndex.toString(),
      endIndex: endIndex.toString()
    };
    callExportJob(downloadLogDataJob);
  };

  const exportAll = async () => {
    const logReference: LogObject = props.log;
    const startIndexIsInclusive = !props.autoRefresh;
    const exportToLas = selectedDownloadFormat === DownloadFormat.Las;
    const isTimeIndexed = log.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    if (isTimeIndexed) {
      const downloadLogDataJob: DownloadLogDataJob = {
        logReference,
        mnemonics: props.mnemonics,
        startIndexIsInclusive,
        exportToLas,
        startIndex: startIndex.toString(),
        endIndex: endIndex.toString()
      };
      callExportJob(downloadLogDataJob);
    } else {
      const downloadLogDataJob: DownloadLogDataJob = {
        logReference,
        mnemonics: props.mnemonics,
        startIndexIsInclusive,
        exportToLas
      };
      callExportJob(downloadLogDataJob);
    }
  };

  const callExportJob = async (downloadLogDataJob: DownloadLogDataJob) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const jobId = await JobService.orderJob(
      JobType.DownloadLogData,
      downloadLogDataJob
    );
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
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

  const exportSelectedDataPoints = useCallback(() => {
    const exportColumns = props.columns
      .map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`)
      .join(exportOptions.separator);
    const data = orderBy(
      props.selectedRows,
      getComparatorByColumn(props.columns[0]),
      [Order.Ascending, Order.Ascending]
    ) //Sorted because order is important when importing data
      .map((row) =>
        props.columns
          .map((col) => row[col.columnOf.mnemonic] as string)
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);
    exportData(props.log.name, exportColumns, data);
  }, [props.columns, props.selectedRows]);

  const executeExport = () => {
    switch (selectedDownloadOption) {
      case DownloadOptions.All:
        exportAll();
        break;
      case DownloadOptions.SelectedRange:
        exportSelectedRange();
        break;
      case DownloadOptions.SelectedIndexValues:
        exportSelectedDataPoints();
    }
  };

  const step =
    curveValueRows?.length > 1
      ? new Date(curveValueRows[1].id.toString()).getTime() -
        new Date(curveValueRows[0].id.toString()).getTime()
      : null;
  const actualSize =
    (new Date(endIndex).getTime() - new Date(startIndex).getTime()) /
    60 /
    60 /
    24;
  const maxSpan = (1290 * step) / props.mnemonics.length;
  const tooBigInterval = actualSize > maxSpan;

  const outOfRange =
    new Date(startIndex).getTime() - new Date(log.startIndex).getTime() < 0 ||
    new Date(endIndex).getTime() - new Date(log.endIndex).getTime() > 0;

  return (
    <ConfirmModal
      heading={`Download log data for ${props.mnemonics.length} mnemonics`}
      confirmDisabled={
        isTimeLog &&
        (!isValidInterval || tooBigInterval) &&
        selectedDownloadOption !== DownloadOptions.SelectedIndexValues
      }
      content={
        <>
          <span>
            <Typography>Choose download option?</Typography>
          </span>

          <label style={alignLayout}>
            <Radio
              name="group"
              checked={selectedDownloadOption === DownloadOptions.SelectedRange}
              onChange={() => {
                setSelectedDownloadOption(DownloadOptions.SelectedRange);
              }}
            />
            <Typography>Download selected range</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              name="group"
              checked={
                selectedDownloadOption === DownloadOptions.SelectedIndexValues
              }
              onChange={() => {
                setSelectedDownloadFormat(DownloadFormat.Csv);
                setSelectedDownloadOption(DownloadOptions.SelectedIndexValues);
              }}
              disabled={!props.selectedRows.length}
            />
            <Typography>Download selected rows</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              name="group"
              checked={selectedDownloadOption === DownloadOptions.All}
              onChange={() => {
                setSelectedDownloadOption(DownloadOptions.All);
              }}
            />
            <Typography>Download all data</Typography>
          </label>
          <br />
          <span>
            <Typography>Choose file type</Typography>
          </span>
          <label style={alignLayout}>
            <Radio
              name="group1"
              checked={selectedDownloadFormat === DownloadFormat.Csv}
              onChange={() => setSelectedDownloadFormat(DownloadFormat.Csv)}
            />
            <Typography>Csv file</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              name="group1"
              checked={selectedDownloadFormat === DownloadFormat.Las}
              onChange={() => setSelectedDownloadFormat(DownloadFormat.Las)}
              disabled={
                selectedDownloadOption === DownloadOptions.SelectedIndexValues
              }
            />
            <Typography>Las file</Typography>
          </label>
          {isTimeLog &&
            tooBigInterval &&
            (selectedDownloadOption === DownloadOptions.All ||
              selectedDownloadOption === DownloadOptions.SelectedRange) && (
              <WarningBar
                message={`Selected range is too large. Reduce the end date to a maximum of ${new Date(
                  new Date(startIndex).getTime() + maxSpan * 60 * 60 * 24
                )} `}
              />
            )}
          {isTimeLog &&
            outOfRange &&
            (selectedDownloadOption === DownloadOptions.All ||
              selectedDownloadOption === DownloadOptions.SelectedRange) && (
              <WarningBar
                message={`Selected start and end dates are out of log range. Available range is between ${log.startIndex} and ${log.endIndex}`}
              />
            )}
          {isTimeLog && selectedDownloadOption === DownloadOptions.All && (
            <AdjustDateTimeIndexRange
              minDate={log.startIndex as string}
              maxDate={log.endIndex as string}
              isDescending={log.direction == WITSML_LOG_ORDERTYPE_DECREASING}
              hideSetButtons={true}
              onStartDateChanged={setStartIndex}
              onEndDateChanged={setEndIndex}
              onValidChange={(isValid: boolean) => setIsValidInterval(isValid)}
            />
          )}
          {isTimeLog &&
            selectedDownloadOption === DownloadOptions.SelectedRange && (
              <AdjustDateTimeIndexRange
                minDate={props.startIndex as string}
                maxDate={props.endIndex as string}
                isDescending={log.direction == WITSML_LOG_ORDERTYPE_DECREASING}
                hideSetButtons={true}
                onStartDateChanged={setStartIndex}
                onEndDateChanged={setEndIndex}
                onValidChange={(isValid: boolean) =>
                  setIsValidInterval(isValid)
                }
              />
            )}
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
};

const alignLayout: CSSProperties = {
  display: "flex",
  alignItems: "center"
};

export default DownloadOptionsSelectionModal;
