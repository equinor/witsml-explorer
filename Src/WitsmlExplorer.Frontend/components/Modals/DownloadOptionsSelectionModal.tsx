import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import React, { CSSProperties, useCallback, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { Radio, Typography } from "@equinor/eds-core-react";
import { CurveValueRow } from "components/ContentViews/CurveValuesView";
import DownloadLogDataJob from "models/jobs/downloadLogDataJob";
import JobService, { JobType } from "services/jobService";
import LogObject, { indexToNumber } from "models/logObject";
import { ReportModal } from "./ReportModal";
import orderBy from "lodash/orderBy";
import {
  ContentTableColumn,
  ContentType,
  ExportableContentTableColumn,
  Order
} from "components/ContentViews/table";
import { CurveSpecification } from "models/logData";
import useExport from "hooks/useExport";

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

  let downloadOptions: DownloadOptions = DownloadOptions.SelectedRange;
  let downloadFormat: DownloadFormat = DownloadFormat.Csv;

  const { exportData, exportOptions } = useExport();
  const [visibleFileTypeSelection, setVisibleFileTypeSelection] =
    useState<boolean>(true);

  const onChangeDownloadOption = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedValue = event.target.value;
    const enumToString = selectedValue as DownloadOptions;
    downloadOptions = enumToString;
    if (downloadOptions === DownloadOptions.SelectedIndexValues) {
      setVisibleFileTypeSelection(false);
    } else {
      setVisibleFileTypeSelection(true);
    }
  };

  const onChangeDownloadFormat = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedValue = event.target.value;
    const enumToString = selectedValue as DownloadFormat;
    downloadFormat = enumToString;
  };

  const exportSelectedRange = async () => {
    const logReference: LogObject = props.log;
    const startIndexIsInclusive = !props.autoRefresh;
    const exportToLas = downloadFormat === DownloadFormat.Las;
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
    const exportToLas = downloadFormat === DownloadFormat.Las;
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
    switch (downloadOptions) {
      case DownloadOptions.All:
        exportAll();
        break;
      case DownloadOptions.SelectedRange:
        exportSelectedRange();
        break;
      case DownloadOptions.SelectedIndexValues:
        exportSelectedDataPoints();
    }
    downloadOptions = DownloadOptions.SelectedRange;
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
              value={DownloadOptions.SelectedRange}
              id={DownloadOptions.SelectedRange}
              onChange={onChangeDownloadOption}
              defaultChecked
            />
            <Typography>Download selected range</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              name="group"
              id={DownloadOptions.SelectedIndexValues}
              value={DownloadOptions.SelectedIndexValues}
              onChange={onChangeDownloadOption}
              disabled={!props.selectedRows.length}
            />
            <Typography>Download selected rows</Typography>
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
          {visibleFileTypeSelection && (
            <>
              <br />
              <span>
                <Typography>Choose file type</Typography>
              </span>
              <label style={alignLayout}>
                <Radio
                  name="group1"
                  value={DownloadFormat.Csv}
                  id={DownloadFormat.Csv}
                  onChange={onChangeDownloadFormat}
                  defaultChecked
                />
                <Typography>Csv file</Typography>
              </label>
              <label style={alignLayout}>
                <Radio
                  name="group1"
                  value={DownloadFormat.Las}
                  onChange={onChangeDownloadFormat}
                  id={DownloadFormat.Las}
                />
                <Typography>Las file</Typography>
              </label>
            </>
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
