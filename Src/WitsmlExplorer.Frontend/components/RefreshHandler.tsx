import { useQueryClient } from "@tanstack/react-query";
import {
  refreshObjectQuery,
  refreshObjectsQuery,
  refreshSearchQuery,
  refreshWellboreQuery,
  refreshWellboresQuery,
  refreshWellQuery,
  refreshWellsQuery
} from "hooks/query/queryRefreshHelpers";
import EntityType from "models/entityType";
import { ObjectType } from "models/objectType";
import React, { useEffect } from "react";
import NotificationService, {
  RefreshAction,
  RefreshType
} from "services/notificationService";
import { convertObjectTypeToObjectFilterType } from "../contexts/filter";

const RefreshHandler = (): React.ReactElement => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe =
      NotificationService.Instance.refreshDispatcher.subscribe(
        (refreshAction: RefreshAction) => {
          try {
            switch (refreshAction.entityType) {
              case EntityType.Well:
                refreshWell(refreshAction);
                break;
              case EntityType.Wellbore:
                refreshWellbore(refreshAction);
                break;
              default:
                if (
                  !Object.values(ObjectType).includes(
                    refreshAction.entityType as ObjectType
                  )
                ) {
                  throw new Error(
                    "Unexpected EntityType when attempting to refresh WITSML objects"
                  );
                }
                if (refreshAction.objectUid != null) {
                  refreshWellboreObject(refreshAction);
                } else if (
                  refreshAction.refreshType === RefreshType.BatchUpdate
                ) {
                  refreshWellboreObjectsBatch(refreshAction);
                } else {
                  refreshWellboreObjects(refreshAction);
                }
                refreshSearchQueries(refreshAction);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
              `Unable to perform refresh action for action: ${refreshAction.refreshType} and entity: ${refreshAction.entityType}`
            );
          }
        }
      );

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  function refreshWell(refreshAction: RefreshAction) {
    if (
      !refreshAction.wellUids &&
      refreshAction.refreshType === RefreshType.Update
    ) {
      refreshWellQuery(
        queryClient,
        refreshAction.serverUrl.toString().toLowerCase(),
        refreshAction.wellUid
      );
    } else {
      // A well has been removed or added, so we need to refresh the entire well list to ensure that it is added or removed from the list.
      refreshWellsQuery(
        queryClient,
        refreshAction.serverUrl.toString().toLowerCase()
      );
    }
  }

  function refreshWellbore(refreshAction: RefreshAction) {
    if (refreshAction.refreshType === RefreshType.Update) {
      refreshWellboreQuery(
        queryClient,
        refreshAction.serverUrl.toString().toLowerCase(),
        refreshAction.wellUid,
        refreshAction.wellboreUid
      );
    } else {
      // A wellbore has been removed or added, so we need to refresh the entire wellbore list to ensure that it is added or removed from the list.
      refreshWellboresQuery(
        queryClient,
        refreshAction.serverUrl.toString().toLowerCase(),
        refreshAction.wellUid
      );
    }
  }

  function refreshWellboreObject(refreshAction: RefreshAction) {
    refreshObjectQuery(
      queryClient,
      refreshAction.serverUrl.toString().toLowerCase(),
      refreshAction.wellUid,
      refreshAction.wellboreUid,
      refreshAction.entityType as ObjectType,
      refreshAction.objectUid
    );
  }

  function refreshWellboreObjectsBatch(refreshAction: RefreshAction) {
    for (const object of refreshAction.objects) {
      refreshObjectQuery(
        queryClient,
        refreshAction.serverUrl.toString().toLowerCase(),
        object.wellUid,
        object.wellboreUid,
        refreshAction.entityType as ObjectType,
        object.uid
      );
    }
  }

  function refreshWellboreObjects(refreshAction: RefreshAction) {
    refreshObjectsQuery(
      queryClient,
      refreshAction.serverUrl.toString().toLowerCase(),
      refreshAction.wellUid,
      refreshAction.wellboreUid,
      refreshAction.entityType as ObjectType
    );
  }

  function refreshSearchQueries(refreshAction: RefreshAction) {
    const filterTypes = convertObjectTypeToObjectFilterType(
      refreshAction.entityType as ObjectType
    );
    if (filterTypes) {
      filterTypes.forEach((filterType) =>
        refreshSearchQuery(
          queryClient,
          refreshAction.serverUrl.toString().toLowerCase(),
          filterType
        )
      );
    }
  }

  return <></>;
};

export default RefreshHandler;
