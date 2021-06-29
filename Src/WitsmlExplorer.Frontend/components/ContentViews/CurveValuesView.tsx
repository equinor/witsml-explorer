import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import orderBy from "lodash/orderBy";
import LogObjectService from "../../services/logObjectService";
import { truncateAbortHandler } from "../../services/apiClient";
import NavigationContext from "../../contexts/navigationContext";
import { CurveSpecification, LogData, LogDataRow } from "../../models/logData";
import { ContentType, VirtualizedContentTable, ContentTableRow, ExportableContentTableColumn, Order, getIndexRanges, ContentTableColumn, getComparatorByColumn } from "./table";
import { WITSML_INDEX_TYPE_DATE_TIME } from "../Constants";
import { Button, Grid, LinearProgress } from "@material-ui/core";
import useExport from "../../hooks/useExport";
import { DeleteLogCurveValuesJob } from "../../models/jobs/deleteLogCurveValuesJob";
import LogObject from "../../models/logObject";
import MnemonicsContextMenu from "../ContextMenus/MnemonicsContextMenu";
import { LogCurveInfoRow } from "./LogCurveInfoListView";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";

interface CurveValueRow extends LogDataRow, ContentTableRow {}

const getDeleteLogCurveValuesJob = (currentSelected: LogCurveInfoRow[], checkedContentItems: ContentTableRow[], selectedLog: LogObject) => {
  const indexRanges = getIndexRanges(checkedContentItems, selectedLog);
  const mnemonics = currentSelected.map((logCurveInfoRow) => logCurveInfoRow.mnemonic);

  const deleteLogCurveValuesJob: DeleteLogCurveValuesJob = {
    logReference: {
      wellUid: selectedLog.wellUid,
      wellboreUid: selectedLog.wellboreUid,
      logUid: selectedLog.uid
    },
    mnemonics: mnemonics,
    indexRanges: indexRanges
  };
  return deleteLogCurveValuesJob;
};

export const CurveValuesView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedWell, selectedWellbore, selectedLog, selectedLogCurveInfo } = navigationState;
  const [columns, setColumns] = useState<ExportableContentTableColumn<CurveSpecification>[]>([]);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<CurveValueRow[]>([]);
  const { exportData, properties: exportOptions } = useExport({
    fileExtension: ".csv",
    newLineCharacter: "\n",
    outputMimeType: "text/csv",
    separator: ",",
    omitSpecialCharactersFromFilename: true,
    appendDateTime: true
  });

  const rowSelectionCallback = useCallback((rows: ContentTableRow[], sortOrder: Order, sortedColumn: ContentTableColumn) => {
    setSelectedRows(orderBy([...rows.map((row) => row as CurveValueRow)], getComparatorByColumn(sortedColumn), [sortOrder, sortOrder]));
  }, []);

  const exportSelectedIndexRange = useCallback(() => {
    const exportColumns = columns.map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`).join(exportOptions.separator);
    const data = tableData.map((row) => columns.map((col) => row[col.columnOf.mnemonic] as string).join(exportOptions.separator)).join(exportOptions.newLineCharacter);
    exportData(`${selectedWellbore.name}-${selectedLog.name}`, exportColumns, data);
  }, [columns, tableData]);

  const exportSelectedDataPoints = useCallback(() => {
    const exportColumns = columns.map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`).join(exportOptions.separator);
    const data = selectedRows.map((row) => columns.map((col) => row[col.columnOf.mnemonic] as string).join(exportOptions.separator)).join(exportOptions.newLineCharacter);
    exportData(`${selectedWellbore.name}-${selectedLog.name}`, exportColumns, data);
  }, [columns, selectedRows]);

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, _: CurveValueRow, checkedContentItems: CurveValueRow[]) => {
    const deleteLogCurveValuesJob = getDeleteLogCurveValuesJob(selectedLogCurveInfo, checkedContentItems, selectedLog);
    const contextMenuProps = { deleteLogCurveValuesJob, dispatchOperation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <MnemonicsContextMenu {...contextMenuProps} />, position } });
  };

  useEffect(() => {
    setTableData([]);
    setIsLoading(true);
    const controller = new AbortController();

    function isNewMnemonic(mnemonic: string) {
      return columns.map((column) => column.property).indexOf(mnemonic) < 0;
    }

    function getColumnType(curveSpecification: CurveSpecification) {
      const isTimeMnemonic = (mnemonic: string) => ["time", "datetime", "date time"].indexOf(mnemonic.toLowerCase()) >= 0;
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
    }

    function updateColumns(curveSpecifications: CurveSpecification[]) {
      const newColumns = curveSpecifications
        .filter((curveSpecification) => isNewMnemonic(curveSpecification.mnemonic))
        .map((curveSpecification) => {
          return {
            columnOf: curveSpecification,
            property: curveSpecification.mnemonic,
            label: `${curveSpecification.mnemonic} (${curveSpecification.unit})`,
            type: getColumnType(curveSpecification)
          };
        });
      setColumns([...columns, ...newColumns]);
    }

    function getProgressRange(startIndex: string, endIndex: string) {
      return selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME
        ? {
            minIndex: new Date(startIndex).getTime(),
            maxIndex: new Date(endIndex).getTime()
          }
        : {
            minIndex: Number(startIndex),
            maxIndex: Number(endIndex)
          };
    }

    function updateProgress(index: string, minIndex: number, maxIndex: number) {
      const normalize = (value: number) => ((value - minIndex) * 100) / (maxIndex - minIndex);
      if (selectedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME) {
        setProgress(normalize(new Date(index).getTime()));
      } else {
        setProgress(normalize(Number(index)));
      }
    }

    async function getLogData() {
      const mnemonics = selectedLogCurveInfo.map((lci) => lci.mnemonic);
      let startIndex = String(selectedLogCurveInfo[0].minIndex);
      const endIndex = String(selectedLogCurveInfo[0].maxIndex);
      const { minIndex, maxIndex } = getProgressRange(startIndex, endIndex);

      let completeData: CurveValueRow[] = [];
      let fetchData = true;
      while (fetchData) {
        const logData: LogData = await LogObjectService.getLogData(
          selectedWell.uid,
          selectedWellbore.uid,
          selectedLog.uid,
          mnemonics,
          completeData.length === 0,
          startIndex,
          endIndex,
          controller.signal
        );
        if (logData && logData.data) {
          updateProgress(logData.endIndex, minIndex, maxIndex);
          updateColumns(logData.curveSpecifications);

          const logDataRows = logData.data.map((data, index) => {
            const row: CurveValueRow = {
              id: completeData.length + index,
              ...data
            };
            return row;
          });
          completeData = [...completeData, ...logDataRows];
          setTableData(completeData);
          startIndex = logData.endIndex;
        } else {
          fetchData = false;
        }
      }
    }

    if (selectedLogCurveInfo) {
      getLogData()
        .catch(truncateAbortHandler)
        .then(() => setIsLoading(false));
    }

    return () => {
      controller.abort();
    };
  }, [selectedLogCurveInfo, selectedLog]);

  return (
    <Container>
      {Boolean(tableData.length) && (
        <ExportButtonGrid container spacing={1}>
          <Grid item>
            {
              <Button disabled={isLoading} onClick={() => exportSelectedIndexRange()}>
                Download all as .csv
              </Button>
            }
          </Grid>
          {Boolean(selectedRows.length) && (
            <Grid item>
              {
                <Button disabled={isLoading} onClick={() => exportSelectedDataPoints()}>
                  Download selected as .csv
                </Button>
              }
            </Grid>
          )}
        </ExportButtonGrid>
      )}
      {isLoading && <LinearProgress variant={"determinate"} value={progress} />}
      {!isLoading && !tableData.length && <Message>No data</Message>}
      {Boolean(columns.length) && Boolean(tableData.length) && (
        <VirtualizedContentTable columns={columns} onRowSelectionChange={rowSelectionCallback} onContextMenu={onContextMenu} data={tableData} checkableRows={true} />
      )}
    </Container>
  );
};

const Container = styled.div`
  height: calc(100% - 55px);
  width: 100%;
`;

const ExportButtonGrid = styled(Grid)`
  padding-bottom: 10px;
  padding-left: 10px;
`;

const Message = styled.div`
  margin: 10px;
  padding: 10px;
`;
