import { Button, Icon, Typography } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import { useWellFilter } from "../../contexts/filter";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Well from "../../models/well";
import WellService from "../../services/wellService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellContextMenu, { WellContextMenuProps } from "../ContextMenus/WellContextMenu";
import formatDateString from "../DateFormatter";
import WellProgress from "../WellProgress";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface WellRow extends ContentTableRow, Well {}

export const WellsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers, wells } = navigationState;
  const {
    dispatchOperation,
    operationState: { timeZone, colors }
  } = useContext(OperationContext);
  const filteredWells = useWellFilter(wells);
  const [lastFetched, setLastFetched] = useState<string>(new Date().toLocaleTimeString());
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(false);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "field", label: "field", type: ContentType.String },
    { property: "operator", label: "operator", type: ContentType.String },
    { property: "timeZone", label: "timeZone", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "dateTimeCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dateTimeLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];

  const onSelect = (well: any) => {
    dispatchNavigation({ type: NavigationType.SelectWell, payload: { well } });
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, well: Well, checkedWellRows: WellRow[]) => {
    const contextProps: WellContextMenuProps = { well, servers, dispatchOperation, checkedWellRows };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellContextMenu {...contextProps} />, position } });
  };

  const getTableData = () => {
    return filteredWells.map((well) => {
      return {
        ...well,
        id: well.uid,
        dateTimeCreation: formatDateString(well.dateTimeCreation, timeZone),
        dateTimeLastChange: formatDateString(well.dateTimeLastChange, timeZone)
      };
    });
  };

  useEffect(() => {
    if (shouldRefresh) {
      setShouldRefresh(false);
      const abortController = new AbortController();
      const refreshWells = async () => {
        WellService.getWells(abortController.signal).then((response) => dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: response } }));
        setLastFetched(new Date().toLocaleTimeString());
      };
      refreshWells();
      dispatchNavigation({ type: NavigationType.CollapseAllTreeNodes, payload: {} });
    }
  }, [shouldRefresh]);

  const panelElements = [
    <Button
      key="refreshJobs"
      aria-disabled={shouldRefresh ? true : false}
      aria-label={shouldRefresh ? "loading data" : null}
      onClick={shouldRefresh ? undefined : () => setShouldRefresh(true)}
      disabled={shouldRefresh}
      colors={colors}
    >
      <Icon name="refresh" />
      Refresh
    </Button>,
    <Typography key="lastFetched">Last fetched: {lastFetched}</Typography>
  ];

  return (
    <WellProgress>
      {wells.length > 0 && filteredWells.length == 0 ? (
        <Typography style={{ padding: "1rem" }}>No wells match the current filter</Typography>
      ) : (
        <ContentTable
          viewId="wellsListView"
          columns={columns}
          data={getTableData()}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          checkableRows
          downloadToCsvFileName="Wells"
          panelElements={panelElements}
        />
      )}
    </WellProgress>
  );
};

export default WellsListView;
