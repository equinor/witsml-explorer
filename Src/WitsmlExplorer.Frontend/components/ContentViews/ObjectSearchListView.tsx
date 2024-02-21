import { Typography } from "@equinor/eds-core-react";
import React, { useContext, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import {
  ObjectFilterType,
  filterTypeToProperty
} from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetObjectSearch } from "../../hooks/query/useGetObjectSearch";
import LogObject from "../../models/logObject";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, { calculateLogTypeId } from "../../models/wellbore";
import NotificationService from "../../services/notificationService";
import ObjectService from "../../services/objectService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectTypeToContextMenu } from "../ContextMenus/ContextMenuMapping";
import { pluralize } from "../ContextMenus/ContextMenuUtils";
import LoadingContextMenu from "../ContextMenus/LoadingContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import ConfirmModal from "../Modals/ConfirmModal";
import ProgressSpinner from "../ProgressSpinner";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface ObjectSearchRow extends ContentTableRow, ObjectOnWellbore {
  object: ObjectOnWellbore;
  well: Well;
  wellbore: Wellbore;
  objectType: ObjectType;
}

export const ObjectSearchListView = (): React.ReactElement => {
  const { dispatchNavigation } = useContext(NavigationContext);
  const { authorizationState } = useAuthorizationState();
  const { dispatchOperation } = useContext(OperationContext);
  const [searchParams] = useSearchParams();
  const { filterType } = useParams<{ filterType: ObjectFilterType }>();
  const value = searchParams.get("value");
  const [fetchAllObjects, setFetchAllObjects] = React.useState(false);
  const { searchResult, isFetching, error, isError } = useGetObjectSearch(authorizationState?.server, filterType, value, fetchAllObjects);

  useEffect(() => {
    if (isError && !!error) {
      const message = (error as Error).message;
      if (
        message.includes("The given search will fetch all") ||
        message.includes("The server does not support to select")
      ) {
        const confirmation = (
          <ConfirmModal
            heading={"Warning: Seach might be slow!"}
            content={
              <>
                <Typography style={{ whiteSpace: "pre-line" }}>{message}</Typography>
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
          serverUrl: new URL(authorizationState?.server.url),
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

  const onContextMenu = async (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedObjectRows: ObjectSearchRow[]
  ) => {
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <LoadingContextMenu />, position }
    });
    const wellbore = checkedObjectRows[0].wellbore;
    const objectType = checkedObjectRows[0].objectType;
    const fetchedObject = await fetchSelectedObject(checkedObjectRows[0]);
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: [fetchedObject],
      wellbore
    };
    const component = ObjectTypeToContextMenu[objectType];
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
    const objects = await ObjectService.getObjects(
      row.wellUid,
      row.wellboreUid,
      row.objectType
    );
    if (row.objectType == ObjectType.Log) {
      const logTypeGroup = calculateLogTypeId(
        row.wellbore,
        (objects.find((o) => o.uid == row.uid) as LogObject)?.indexType
      );
      row.wellbore.logs = objects;
      dispatchNavigation({
        type: NavigationType.SelectLogType,
        payload: {
          well: row.well,
          wellbore: row.wellbore,
          logTypeGroup: logTypeGroup
        }
      });
    } else {
      dispatchNavigation({
        type: NavigationType.SelectObjectGroup,
        payload: {
          objectType: row.objectType,
          wellUid: row.wellUid,
          wellboreUid: row.wellboreUid,
          objects
        }
      });
    }
  };

  if (isFetching) {
    return (
      <ProgressSpinner message={`Fetching ${pluralize(filterType)}.`} />
    );
  }

  return searchResult.length == 0 ? (
    <Typography style={{ padding: "1rem", whiteSpace: "pre-line" }}>
      {`No ${pluralize(filterType).toLowerCase()} match the current filter.`}
    </Typography>
  ) : (
    <ContentTable
      viewId="objectOnWellboreListView"
      columns={getColumns()}
      onSelect={onSelect}
      data={searchResult}
      onContextMenu={onContextMenu}
      downloadToCsvFileName={`${filterType}_search`}
    />
  );
};

export default ObjectSearchListView;

