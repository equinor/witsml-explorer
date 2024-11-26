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

export interface DownloadOptionsSelectionModalProps {
  mnemonics: string[];
  selectedRows: CurveValueRow[];
  log: LogObject;
  startIndex: string;
  endIndex: string;
  columns: ExportableContentTableColumn<CurveSpecification>[];
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
  const [selectedDownloadOption, setSelectedDownloadOption] = useState<string>(
    DownloadOptions.SelectedRange
  );

  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState<string>(
    DownloadFormat.Csv
  );

  const { exportData, exportOptions } = useExport();

  const exportSelectedRange = async () => {
    const logReference: LogObject = props.log;
    const startIndexIsInclusive = !props.autoRefresh;
    const exportToLas = selectedDownloadFormat === DownloadFormat.Las;
    const downloadLogDataJob: DownloadLogDataJob = {
      logReference,
      mnemonics: props.mnemonics,
      startIndexIsInclusive,
      exportToLas,
      startIndex: props.startIndex,
      endIndex: props.endIndex
    };
    callExportJob(downloadLogDataJob);
  };

  const exportAll = async () => {
    const logReference: LogObject = props.log;
    const startIndexIsInclusive = !props.autoRefresh;
    const exportToLas = selectedDownloadFormat === DownloadFormat.Las;
    const downloadLogDataJob: DownloadLogDataJob = {
      logReference,
      mnemonics: props.mnemonics,
      startIndexIsInclusive,
      exportToLas
    };
    callExportJob(downloadLogDataJob);
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

  return (
    <ConfirmModal
      heading={`Download log data for ${props.mnemonics.length} mnemonics`}
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
