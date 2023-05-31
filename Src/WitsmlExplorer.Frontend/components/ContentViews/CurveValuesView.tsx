import { Button, Grid, LinearProgress } from "@material-ui/core";
import orderBy from "lodash/orderBy";
import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import useExport from "../../hooks/useExport";
import { DeleteLogCurveValuesJob } from "../../models/jobs/deleteLogCurveValuesJob";
import { CurveSpecification, LogData, LogDataRow } from "../../models/logData";
import LogObject from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import LogObjectService from "../../services/logObjectService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import MnemonicsContextMenu from "../ContextMenus/MnemonicsContextMenu";
import { LogCurveInfoRow } from "./LogCurveInfoListView";
import {
  ContentTableColumn,
  ContentTableRow,
  ExportableContentTableColumn,
  Order,
  VirtualizedContentTable,
  calculateProgress,
  getColumnType,
  getComparatorByColumn,
  getIndexRanges,
  getProgressRange
} from "./table";

interface CurveValueRow extends LogDataRow, ContentTableRow {}

export const CurveValuesView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedWell, selectedWellbore, selectedObject, selectedLogCurveInfo } = navigationState;
  const [columns, setColumns] = useState<ExportableContentTableColumn<CurveSpecification>[]>([]);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<CurveValueRow[]>([]);
  const selectedLog = selectedObject as LogObject;
  const { exportData, properties: exportOptions } = useExport({
    fileExtension: ".csv",
    newLineCharacter: "\n",
    outputMimeType: "text/csv",
    separator: ",",
    omitSpecialCharactersFromFilename: true,
    appendDateTime: true
  });

  const getDeleteLogCurveValuesJob = (currentSelected: LogCurveInfoRow[], checkedContentItems: ContentTableRow[], selectedLog: LogObject) => {
    const indexRanges = getIndexRanges(checkedContentItems, selectedLog);
    const mnemonics = currentSelected.map((logCurveInfoRow) => logCurveInfoRow.mnemonic);

    const deleteLogCurveValuesJob: DeleteLogCurveValuesJob = {
      logReference: toObjectReference(selectedLog),
      mnemonics: mnemonics,
      indexRanges: indexRanges
    };
    return deleteLogCurveValuesJob;
  };

  const rowSelectionCallback = useCallback((rows: ContentTableRow[], sortOrder: Order, sortedColumn: ContentTableColumn) => {
    setSelectedRows(orderBy([...rows.map((row) => row as CurveValueRow)], getComparatorByColumn(sortedColumn), [sortOrder, sortOrder]));
  }, []);

  const exportSelectedIndexRange = useCallback(() => {
    const exportColumns = columns.map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`).join(exportOptions.separator);
    const data = orderBy(tableData, getComparatorByColumn(columns[0]), [Order.Ascending, Order.Ascending]) //Sorted because order is important when importing data
      .map((row) => columns.map((col) => row[col.columnOf.mnemonic] as string).join(exportOptions.separator))
      .join(exportOptions.newLineCharacter);
    exportData(`${selectedWellbore.name}-${selectedLog.name}`, exportColumns, data);
  }, [columns, tableData]);

  const exportSelectedDataPoints = useCallback(() => {
    const exportColumns = columns.map((column) => `${column.columnOf.mnemonic}[${column.columnOf.unit}]`).join(exportOptions.separator);
    const data = orderBy(selectedRows, getComparatorByColumn(columns[0]), [Order.Ascending, Order.Ascending]) //Sorted because order is important when importing data
      .map((row) => columns.map((col) => row[col.columnOf.mnemonic] as string).join(exportOptions.separator))
      .join(exportOptions.newLineCharacter);
    exportData(`${selectedWellbore.name}-${selectedLog.name}`, exportColumns, data);
  }, [columns, selectedRows]);

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>, _: CurveValueRow, checkedContentItems: CurveValueRow[]) => {
    const deleteLogCurveValuesJob = getDeleteLogCurveValuesJob(selectedLogCurveInfo, checkedContentItems, selectedLog);
    const contextMenuProps = { deleteLogCurveValuesJob, dispatchOperation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <MnemonicsContextMenu {...contextMenuProps} />, position } });
  };

  const updateColumns = (curveSpecifications: CurveSpecification[]) => {
    const isNewMnemonic = (mnemonic: string) => {
      return columns.map((column) => column.property).indexOf(mnemonic) < 0;
    };
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
  };

  useEffect(() => {
    setTableData([]);
    setIsLoading(true);
    const controller = new AbortController();

    async function getLogData() {
      const mnemonics = selectedLogCurveInfo.map((lci) => lci.mnemonic);
      let startIndex = String(selectedLogCurveInfo[0].minIndex);
      const endIndex = String(selectedLogCurveInfo[0].maxIndex);
      const { minIndex, maxIndex } = getProgressRange(startIndex, endIndex, selectedLog.indexType);

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
          setProgress(calculateProgress(logData.endIndex, minIndex, maxIndex, selectedLog.indexType));
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
  height: calc(100% - 65px);
  width: calc(100% - 14px);
`;

const ExportButtonGrid = styled(Grid)`
  padding: 10px;
`;

const Message = styled.div`
  margin: 10px;
  padding: 10px;
`;
