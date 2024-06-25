import { Typography } from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import LoadingContextMenu from "components/ContextMenus/LoadingContextMenu";
import WellboreContextMenu, {
  WellboreContextMenuProps
} from "components/ContextMenus/WellboreContextMenu";
import ProgressSpinner from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  FilterContext,
  WellboreFilterType,
  filterTypeToProperty
} from "contexts/filter";
import { MousePosition } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWellboreSearch } from "hooks/query/useGetWellboreSearch";
import { useOperationState } from "hooks/useOperationState";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React, { ReactElement, useContext, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getObjectGroupsViewPath } from "routes/utils/pathBuilder";
import NotificationService from "services/notificationService";
import WellboreService from "services/wellboreService";

export interface WellboreSearchRow extends ContentTableRow, Wellbore {
  well: Well;
  wellbore: Wellbore;
}

export const WellboreSearchListView = (): ReactElement => {
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useOperationState();
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const [searchParams] = useSearchParams();
  const { filterType } = useParams<{ filterType: WellboreFilterType }>();
  const value = searchParams.get("value");
  const { servers } = useGetServers();
  const { wellboreSearchResults, isFetching, error, isError } =
    useGetWellboreSearch(connectedServer, filterType, value);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !isFetching &&
      !isError &&
      wellboreSearchResults !== selectedFilter.wellboreSearchResults
    ) {
      updateSelectedFilter({
        wellboreSearchResults: wellboreSearchResults,
        filterType,
        name: value
      });
    }
  }, [wellboreSearchResults]);

  useEffect(() => {
    if (isError && !!error) {
      const message = (error as Error).message;
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: new URL(connectedServer.url),
        message: message,
        isSuccess: false,
        severity: "error"
      });
    }
  }, [error, isError]);

  const fetchSelectedWellbore = async (
    checkedWellboreRow: WellboreSearchRow
  ) => {
    return await WellboreService.getWellbore(
      checkedWellboreRow.wellUid,
      checkedWellboreRow.uid
    );
  };

  const onContextMenuSingleWellbore = async (
    checkedWellboreRow: WellboreSearchRow,
    position: MousePosition
  ) => {
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <LoadingContextMenu />, position }
    });
    const fetchedWellbore = await fetchSelectedWellbore(checkedWellboreRow);
    const contextProps: WellboreContextMenuProps = {
      servers: servers,
      wellbore: fetchedWellbore,
      checkedWellboreRows: []
    };
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WellboreContextMenu {...contextProps} />,
        position
      }
    });
  };

  const onContextMenu = async (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedWellboreRows: WellboreSearchRow[]
  ) => {
    const position = getContextMenuPosition(event);
    if (checkedWellboreRows.length === 1) {
      await onContextMenuSingleWellbore(checkedWellboreRows[0], position);
    }
  };

  const getColumns = () => {
    const columns: ContentTableColumn[] = [
      { property: "name", label: "name", type: ContentType.String },
      { property: "wellName", label: "wellName", type: ContentType.String },
      { property: "uid", label: "uid", type: ContentType.String },
      { property: "wellUid", label: "wellUid", type: ContentType.String }
    ];

    if (filterTypeToProperty[filterType] != "name") {
      columns.unshift({
        property: "searchProperty",
        label: filterTypeToProperty[filterType],
        type: ContentType.String
      });
    }

    return columns;
  };

  const onSelect = async (row: WellboreSearchRow) => {
    navigate(
      getObjectGroupsViewPath(connectedServer.url, row.wellUid, row.uid)
    );
  };

  if (isFetching) {
    return <ProgressSpinner message={`Fetching wellbores.`} />;
  }

  return wellboreSearchResults.length == 0 ? (
    <Typography style={{ padding: "1rem", whiteSpace: "pre-line" }}>
      {`No wellbores match the current filter.`}
    </Typography>
  ) : (
    <ContentTable
      viewId="wellboreSearchListView"
      checkableRows
      columns={getColumns()}
      onSelect={onSelect}
      data={wellboreSearchResults}
      onContextMenu={onContextMenu}
      downloadToCsvFileName={`${filterType}_search`}
    />
  );
};
