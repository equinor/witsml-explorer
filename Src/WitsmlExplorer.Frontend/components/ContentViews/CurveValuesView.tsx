import { Checkbox, Typography } from "@equinor/eds-core-react";
import { Button } from "@material-ui/core";
import orderBy from "lodash/orderBy";
import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import useExport from "../../hooks/useExport";
import { DeleteLogCurveValuesJob, IndexRange } from "../../models/jobs/deleteLogCurveValuesJob";
import { CurveSpecification, LogData, LogDataRow } from "../../models/logData";
import LogObject, { indexToNumber } from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import LogObjectService from "../../services/logObjectService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import MnemonicsContextMenu from "../ContextMenus/MnemonicsContextMenu";
import ProgressSpinner from "../ProgressSpinner";
import { CurveValuesPlot } from "./CurveValuesPlot";
import EditInterval from "./EditInterval";
import { LogCurveInfoRow } from "./LogCurveInfoListView";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType, ExportableContentTableColumn, Order } from "./table";

interface CurveValueRow extends LogDataRow, ContentTableRow {}

export const CurveValuesView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    dispatchOperation,
    operationState: { colors }
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore, selectedObject, selectedLogCurveInfo } = navigationState;
  const [columns, setColumns] = useState<ExportableContentTableColumn<CurveSpecification>[]>([]);
  const [tableData, setTableData] = useState<CurveValueRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRows, setSelectedRows] = useState<CurveValueRow[]>([]);
  const [showPlot, setShowPlot] = useState<boolean>(false);
  const selectedLog = selectedObject as LogObject;
  const { exportData, exportOptions } = useExport();

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
      const startIndex = String(selectedLogCurveInfo[0].minIndex);
      const endIndex = String(selectedLogCurveInfo[0].maxIndex);

      let completeData: CurveValueRow[] = [];
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

  const panelElements = [
    <Button key="downloadall" disabled={isLoading} onClick={() => exportSelectedIndexRange()}>
      Download all as .csv
    </Button>,
    <Button key="downloadselected" disabled={isLoading || !selectedRows.length} onClick={() => exportSelectedDataPoints()}>
      Download selected as .csv
    </Button>
  ];

  return (
    <>
      {isLoading && <ProgressSpinner message="Fetching data" />}
      {!isLoading && !tableData.length && <Message>No data</Message>}
      {Boolean(columns.length) && Boolean(tableData.length) && (
        <>
          <Container>
            <EditInterval key="editinterval" />,
            <Checkbox checked={showPlot} onChange={() => setShowPlot(!showPlot)} />
            <Typography style={{ color: colors.text.staticIconsDefault }}>Show Plot</Typography>
          </Container>
          {showPlot ? (
            <CurveValuesPlot data={tableData} columns={columns} name={selectedLog.name} />
          ) : (
            <ContentTable
              columns={columns}
              onRowSelectionChange={(rows) => setSelectedRows(rows as CurveValueRow[])}
              onContextMenu={onContextMenu}
              data={tableData}
              checkableRows={true}
              panelElements={panelElements}
              stickyLeftColumns={2}
            />
          )}
        </>
      )}
    </>
  );
};
const Message = styled.div`
  margin: 10px;
  padding: 10px;
`;

const getIndexRanges = (checkedContentItems: ContentTableRow[], selectedLog: LogObject): IndexRange[] => {
  const sortedItems = checkedContentItems.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const indexCurve = selectedLog.indexCurve;

  return sortedItems.reduce((accumulator: IndexRange[], currentElement: any, currentIndex) => {
    const currentId = currentElement["id"];
    const indexValue = String(currentElement[indexCurve]);

    if (accumulator.length === 0) {
      accumulator.push({ startIndex: indexValue, endIndex: indexValue });
    } else {
      const inSameRange = currentId - sortedItems[currentIndex - 1].id === 1;
      if (inSameRange) {
        accumulator[accumulator.length - 1].endIndex = indexValue;
      } else {
        accumulator.push({ startIndex: indexValue, endIndex: indexValue });
      }
    }
    return accumulator;
  }, []);
};

const getComparatorByColumn = (column: ContentTableColumn): [(row: any) => any, string] => {
  let comparator;
  switch (column.type) {
    case ContentType.Number:
      comparator = (row: any): number => Number(row[column.property]);
      break;
    case ContentType.Measure:
      comparator = (row: any): number => Number(indexToNumber(row[column.property]));
      break;
    default:
      comparator = (row: any): string => row[column.property];
      break;
  }
  return [comparator, column.property];
};

const getColumnType = (curveSpecification: CurveSpecification) => {
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
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  > p {
    margin-left: -0.5rem;
  }
`;
