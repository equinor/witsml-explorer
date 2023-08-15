import { Button, Icon, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import React, { useCallback, useContext, useState } from "react";
import styled from "styled-components";
import { ContentTableColumn } from ".";
import ModificationType from "../../../contexts/modificationType";
import NavigationContext from "../../../contexts/navigationContext";
import OperationContext from "../../../contexts/operationContext";
import useExport from "../../../hooks/useExport";
import ObjectService from "../../../services/objectService";
import { ColumnOptionsMenu } from "./ColumnOptionsMenu";

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
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { selectedWellbore, selectedObjectGroup } = navigationState;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { exportData, exportOptions } = useExport();

  const selectedItemsText = checkableRows ? `Selected: ${numberOfCheckedItems}/${numberOfItems}` : `Items: ${numberOfItems}`;

  const onClickRefresh = async () => {
    setIsRefreshing(true);
    const wellUid = selectedWellbore.wellUid;
    const wellboreUid = selectedWellbore.uid;
    const wellboreObjects = await ObjectService.getObjects(wellUid, wellboreUid, selectedObjectGroup);
    dispatchNavigation({ type: ModificationType.UpdateWellboreObjects, payload: { wellboreObjects, wellUid, wellboreUid, objectType: selectedObjectGroup } });
    setIsRefreshing(false);
  };

  const exportAsCsv = useCallback(() => {
    const exportColumns = table
      .getVisibleLeafColumns()
      .map((c) => c.id)
      .filter((c) => !csvIgnoreColumns.includes(c))
      .join(exportOptions.separator);
    const csvString = table
      .getRowModel()
      .rows.map((row) =>
        row
          .getVisibleCells()
          .filter((cell) => !csvIgnoreColumns.includes(cell.column.id))
          .map((cell) => cell.getValue())
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);
    exportData(downloadToCsvFileName, exportColumns, csvString);
  }, [columns, table]);

  return (
    <Div>
      <ColumnOptionsMenu checkableRows={checkableRows} table={table} viewId={viewId} columns={columns} expandableRows={expandableRows} stickyLeftColumns={stickyLeftColumns} />
      <Typography style={{ color: colors.text.staticIconsDefault }}>{selectedItemsText}</Typography>
      {showRefresh && (
        <Button
          key="refreshObject"
          variant="outlined"
          aria-disabled={isRefreshing ? true : false}
          aria-label={isRefreshing ? "loading data" : null}
          onClick={onClickRefresh}
          disabled={isRefreshing}
        >
          <Icon name="refresh" />
          Refresh
        </Button>
      )}
      {downloadToCsvFileName != null && (
        <Button key="download" variant="outlined" aria-label="download as csv" onClick={exportAsCsv}>
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
