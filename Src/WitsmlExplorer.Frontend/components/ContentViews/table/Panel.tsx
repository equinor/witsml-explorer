import { Button, Icon, Typography } from "@equinor/eds-core-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import { ColumnOptionsMenu } from "components/ContentViews/table/ColumnOptionsMenu";
import {
  refreshObjectQuery,
  refreshObjectsQuery,
  refreshWellQuery,
  refreshWellsQuery
} from "hooks/query/queryRefreshHelpers";
import useExport, { encloseCell } from "hooks/useExport";
import { ObjectType } from "models/objectType";
import React, { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { ContentTableColumn } from ".";

export interface PanelProps {
  checkableRows: boolean;
  numberOfItems: number;
  showRefresh?: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
  table: Table<any>;
  viewId?: string;
  columns?: ContentTableColumn[];
  expandableRows?: boolean;
  stickyLeftColumns?: number;
  downloadToCsvFileName?: string;
}

const csvIgnoreColumns = ["select", "expander"]; //Ids of the columns that should be ignored when downloading as csv

const Panel = (props: PanelProps) => {
  const {
    checkableRows,
    panelElements,
    numberOfCheckedItems,
    numberOfItems,
    showRefresh,
    table,
    viewId,
    columns,
    expandableRows = false,
    downloadToCsvFileName = null,
    stickyLeftColumns
  } = props;
  const { exportData, exportOptions } = useExport();
  const abortRefreshControllerRef = React.useRef<AbortController>();
  const queryClient = useQueryClient();
  const { serverUrl, wellUid, wellboreUid, objectGroup, objectUid } =
    useParams();

  const selectedItemsText = checkableRows
    ? `Selected: ${numberOfCheckedItems}/${numberOfItems}`
    : `Items: ${numberOfItems}`;

  useEffect(() => {
    return () => {
      abortRefreshControllerRef.current?.abort();
    };
  }, []);

  const onClickRefresh = async () => {
    if (!wellUid) {
      refreshWellsQuery(queryClient, serverUrl);
    } else if (!wellboreUid) {
      refreshWellQuery(queryClient, serverUrl, wellUid);
    } else if (!objectUid) {
      refreshObjectsQuery(
        queryClient,
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup as ObjectType
      );
    } else {
      refreshObjectQuery(
        queryClient,
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup as ObjectType,
        objectUid
      );
    }
  };

  const exportAsCsv = useCallback(() => {
    const exportColumns = table
      .getVisibleLeafColumns()
      .map((c) => c.id)
      .filter((c) => !csvIgnoreColumns.includes(c))
      .map((c) => encloseCell(c))
      .join(exportOptions.separator);
    const csvString = table
      .getRowModel()
      .rows.map((row) =>
        row
          .getVisibleCells()
          .filter((cell) => !csvIgnoreColumns.includes(cell.column.id))
          .map((cell) => cell.getValue()?.toString() || "")
          .map((value) => encloseCell(value))
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);
    exportData(downloadToCsvFileName, exportColumns, csvString);
  }, [columns, table]);

  return (
    <Div>
      <ColumnOptionsMenu
        checkableRows={checkableRows}
        table={table}
        viewId={viewId}
        columns={columns}
        expandableRows={expandableRows}
        stickyLeftColumns={stickyLeftColumns}
      />
      <Typography>{selectedItemsText}</Typography>
      {showRefresh && (
        <Button key="refreshObjects" onClick={onClickRefresh}>
          <Icon name="refresh" />
          Refresh
        </Button>
      )}
      {downloadToCsvFileName != null && (
        <Button
          key="download"
          aria-label="download as csv"
          onClick={exportAsCsv}
        >
          Download as .csv
        </Button>
      )}
      {panelElements}
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 4px;
  white-space: nowrap;
`;

export default Panel;
