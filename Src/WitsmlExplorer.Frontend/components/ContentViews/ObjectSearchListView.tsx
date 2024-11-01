import { Typography } from "@equinor/eds-core-react";
import { WITSML_INDEX_TYPE_DATE_TIME } from "components/Constants";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { BatchModifyMenuItem } from "components/ContextMenus/BatchModifyMenuItem";
import ContextMenu, {
  getContextMenuPosition
} from "components/ContextMenus/ContextMenu";
import { ObjectTypeToContextMenu } from "components/ContextMenus/ContextMenuMapping";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import LoadingContextMenu from "components/ContextMenus/LoadingContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import ConfirmModal from "components/Modals/ConfirmModal";
import ProgressSpinner from "components/ProgressSpinner";
import { isExpandableGroupObject } from "components/Sidebar/ObjectGroupItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  FilterContext,
  ObjectFilterType,
  filterTypeToProperty
} from "contexts/filter";
import { MousePosition } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetObjectSearch } from "hooks/query/useGetObjectSearch";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import {
  getLogObjectViewPath,
  getObjectViewPath,
  getObjectsViewPath
} from "routes/utils/pathBuilder";
import NotificationService from "services/notificationService";
import ObjectService from "services/objectService";

export interface ObjectSearchRow extends ContentTableRow, ObjectOnWellbore {
  object: ObjectOnWellbore;
  well: Well;
  wellbore: Wellbore;
  objectType: ObjectType;
}

export const ObjectSearchListView = (): ReactElement => {
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useOperationState();
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const [searchParams] = useSearchParams();
  const { filterType } = useParams<{ filterType: ObjectFilterType }>();
  const value = searchParams.get("value");
  const [fetchAllObjects, setFetchAllObjects] = useState(false);
  const currentFilterType = useRef(filterType);
  const { searchResults, isFetching, error, isError } = useGetObjectSearch(
    connectedServer,
    filterType,
    value,
    fetchAllObjects,
    { enabled: filterType === currentFilterType.current }
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !isFetching &&
      !isError &&
      searchResults !== selectedFilter.searchResults
    ) {
      updateSelectedFilter({ searchResults, filterType, name: value });
    }
  }, [searchResults]);

  useEffect(() => {
    currentFilterType.current = filterType;
    setFetchAllObjects(false);
  }, [filterType]);

  useEffect(() => {
    if (isError && !!error) {
      const message = (error as Error).message;
      if (
        message.includes("The given search will fetch all") ||
        message.includes("The server does not support to select")
      ) {
        const confirmation = (
          <ConfirmModal
            heading={"Warning: Search might be slow!"}
            content={
              <>
                <Typography style={{ whiteSpace: "pre-line" }}>
                  {message}
                </Typography>
              </>
            }
            onConfirm={() => {
              dispatchOperation({ type: OperationType.HideModal });
              setFetchAllObjects(true);
            }}
            confirmColor={"danger"}
            switchButtonPlaces={true}
          />
        );
        dispatchOperation({
          type: OperationType.DisplayModal,
          payload: confirmation
        });
      } else {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(connectedServer.url),
          message: message,
          isSuccess: false,
          severity: "error"
        });
      }
    }
  }, [error, isError]);

  const fetchSelectedObject = async (checkedObjectRow: ObjectSearchRow) => {
    return await ObjectService.getObject(
      checkedObjectRow.wellUid,
      checkedObjectRow.wellboreUid,
      checkedObjectRow.uid,
      checkedObjectRow.objectType
    );
  };

  const onContextMenuSingleObject = async (
    checkedObjectRow: ObjectSearchRow,
    position: MousePosition
  ) => {
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <LoadingContextMenu />, position }
    });
    const fetchedObject = await fetchSelectedObject(checkedObjectRow);
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: [fetchedObject]
    };
    const component = ObjectTypeToContextMenu[checkedObjectRow.objectType];
    if (component) {
      dispatchOperation({
        type: OperationType.DisplayContextMenu,
        payload: {
          component: React.createElement(component, { ...contextProps }),
          position
        }
      });
    }
  };

  const onContextMenuMultipleObjects = async (
    checkedObjectRows: ObjectSearchRow[],
    position: MousePosition
  ) => {
    const onlyOneObjectType = checkedObjectRows.every(
      (row) => row.objectType === checkedObjectRows[0].objectType
    );
    if (!onlyOneObjectType) {
      return;
    }
    const objectType = checkedObjectRows[0].objectType;

    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: (
          <ContextMenu
            menuItems={[
              <BatchModifyMenuItem
                key="batchModify"
                checkedObjects={checkedObjectRows}
                objectType={objectType}
              />
            ]}
          />
        ),
        position
      }
    });
  };

  const onContextMenu = async (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedObjectRows: ObjectSearchRow[]
  ) => {
    const position = getContextMenuPosition(event);
    // If only one object is selected, show the normal context menu for that object. Otherwise, show the batch menu.
    if (checkedObjectRows.length === 1) {
      await onContextMenuSingleObject(checkedObjectRows[0], position);
    } else {
      await onContextMenuMultipleObjects(checkedObjectRows, position);
    }
  };

  const getColumns = () => {
    const columns: ContentTableColumn[] = [
      { property: "objectType", label: "objectType", type: ContentType.String },
      { property: "name", label: "name", type: ContentType.String },
      {
        property: "wellboreName",
        label: "wellboreName",
        type: ContentType.String
      },
      { property: "wellName", label: "wellName", type: ContentType.String },
      { property: "uid", label: "uid", type: ContentType.String },
      {
        property: "wellboreUid",
        label: "wellboreUid",
        type: ContentType.String
      },
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

  const onSelect = async (row: ObjectSearchRow) => {
    const objectType = row.objectType;
    if (objectType == ObjectType.Log) {
      const fetchedLog = (await fetchSelectedObject(row)) as LogObject;
      const logType =
        fetchedLog.indexType === WITSML_INDEX_TYPE_DATE_TIME
          ? RouterLogType.TIME
          : RouterLogType.DEPTH;
      navigate(
        getLogObjectViewPath(
          connectedServer?.url,
          row.wellUid,
          row.wellboreUid,
          ObjectType.Log,
          logType,
          row.uid
        )
      );
    } else {
      if (isExpandableGroupObject(objectType)) {
        navigate(
          getObjectViewPath(
            connectedServer?.url,
            row.wellUid,
            row.wellboreUid,
            objectType,
            row.uid
          )
        );
      } else {
        navigate(
          getObjectsViewPath(
            connectedServer?.url,
            row.wellUid,
            row.wellboreUid,
            objectType
          )
        );
      }
    }
  };

  if (isFetching) {
    return <ProgressSpinner message={`Fetching ${pluralize(filterType)}.`} />;
  }

  return searchResults.length == 0 ? (
    <Typography style={{ padding: "1rem", whiteSpace: "pre-line" }}>
      {`No ${pluralize(filterType).toLowerCase()} match the current filter.`}
    </Typography>
  ) : (
    <ContentTable
      viewId="objectSearchListView"
      checkableRows
      columns={getColumns()}
      onSelect={onSelect}
      data={searchResults}
      onContextMenu={onContextMenu}
      downloadToCsvFileName={`${filterType}_search`}
    />
  );
};

export default ObjectSearchListView;
