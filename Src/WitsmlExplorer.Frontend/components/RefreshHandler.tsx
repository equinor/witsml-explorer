import { useQueryClient } from "@tanstack/react-query";
import {
  refreshObjectQuery,
  refreshObjectsQuery,
  refreshWellQuery,
  refreshWellboreQuery,
  refreshWellboresQuery,
  refreshWellsQuery
} from "hooks/query/queryRefreshHelpers";
import EntityType from "models/entityType";
import { ObjectType } from "models/objectType";
import React, { useEffect } from "react";
import NotificationService, {
  RefreshAction,
  RefreshType
} from "services/notificationService";

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
                if (refreshAction.objectUid == null) {
                  refreshWellboreObjects(refreshAction);
                } else {
                  refreshWellboreObject(refreshAction);
                }
            }
          } catch (error) {
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

  function refreshWellboreObjects(refreshAction: RefreshAction) {
    refreshObjectsQuery(
      queryClient,
      refreshAction.serverUrl.toString().toLowerCase(),
      refreshAction.wellUid,
      refreshAction.wellboreUid,
      refreshAction.entityType as ObjectType
    );
  }

  return <></>;
};

export default RefreshHandler;
