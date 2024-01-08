import { Button, Icon, Typography } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import { ColumnOptionsMenu } from "components/ContentViews/table/ColumnOptionsMenu";
import ModificationType from "contexts/modificationType";
import NavigationContext from "contexts/navigationContext";
import { treeNodeIsExpanded } from "contexts/navigationStateReducer";
import NavigationType from "contexts/navigationType";
import useExport, { encloseCell } from "hooks/useExport";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ObjectService from "services/objectService";
import WellService from "services/wellService";
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
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedObject,
    selectedObjectGroup,
    currentSelected,
    expandedTreeNodes
  } = navigationState;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { exportData, exportOptions } = useExport();
  const abortRefreshControllerRef = React.useRef<AbortController>();

  const selectedItemsText = checkableRows
    ? `Selected: ${numberOfCheckedItems}/${numberOfItems}`
    : `Items: ${numberOfItems}`;

  useEffect(() => {
    return () => {
      abortRefreshControllerRef.current?.abort();
    };
  }, []);

  const refreshObjects = async () => {
    abortRefreshControllerRef.current = new AbortController();
    const wellUid = selectedWellbore.wellUid;
    const wellboreUid = selectedWellbore.uid;
    const wellboreObjects = await ObjectService.getObjects(
      wellUid,
      wellboreUid,
      selectedObjectGroup,
      abortRefreshControllerRef.current.signal
    );
    dispatchNavigation({
      type: ModificationType.UpdateWellboreObjects,
      payload: {
        wellboreObjects,
        wellUid,
        wellboreUid,
        objectType: selectedObjectGroup
      }
    });
  };

  const refreshObject = async () => {
    abortRefreshControllerRef.current = new AbortController();
    const wellUid = selectedWellbore.wellUid;
    const wellboreUid = selectedWellbore.uid;
    const uid = selectedObject.uid;
    let freshObject = await ObjectService.getObject(
      wellUid,
      wellboreUid,
      uid,
      selectedObjectGroup
    );
    const isDeleted = !freshObject;
    if (isDeleted) {
      freshObject = selectedObject;
    }
    dispatchNavigation({
      type: ModificationType.UpdateWellboreObject,
      payload: {
        objectToUpdate: freshObject,
        objectType: selectedObjectGroup,
        isDeleted
      }
    });
  };

  const refreshWells = async () => {
    abortRefreshControllerRef.current = new AbortController();
    const wells = await WellService.getWells(
      abortRefreshControllerRef.current.signal
    );
    dispatchNavigation({
      type: ModificationType.UpdateWells,
      payload: { wells }
    });
    dispatchNavigation({
      type: NavigationType.SelectServer,
      payload: { server: selectedServer }
    });
  };

  const refreshWell = async () => {
    abortRefreshControllerRef.current = new AbortController();
    const nodeId = selectedWell.uid;
    if (treeNodeIsExpanded(expandedTreeNodes, nodeId)) {
      dispatchNavigation({
        type: NavigationType.CollapseTreeNodeChildren,
        payload: { nodeId }
      });
    }

    const well = await WellService.getWell(
      nodeId,
      abortRefreshControllerRef.current.signal
    );
    dispatchNavigation({
      type: ModificationType.UpdateWell,
      payload: { well, overrideWellbores: true }
    });
    dispatchNavigation({ type: NavigationType.SelectWell, payload: { well } });
  };

  const onClickRefresh = async () => {
    setIsRefreshing(true);
    if (currentSelected === selectedServer) {
      await refreshWells();
    } else if (currentSelected === selectedWell) {
      await refreshWell();
    } else if (currentSelected === selectedObject) {
      await refreshObject();
    } else {
      await refreshObjects();
    }
    setIsRefreshing(false);
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
        <Button
          key="refreshObjects"
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
