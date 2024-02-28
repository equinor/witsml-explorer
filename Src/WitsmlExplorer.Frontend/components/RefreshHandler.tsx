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
        async (refreshAction: RefreshAction) => {
          try {
            switch (refreshAction.entityType) {
              case EntityType.Well:
                await refreshWell(refreshAction);
                break;
              case EntityType.Wellbore:
                await refreshWellbore(refreshAction);
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
                  await refreshWellboreObjects(refreshAction);
                } else {
                  await refreshWellboreObject(refreshAction);
                }
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

  async function refreshWell(refreshAction: RefreshAction) {
    if (refreshAction.refreshType === RefreshType.Update) {
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
      // TODO: See if we can find a way to only re-fetch the well, and add/remove it from the complete list. If we just run the refreshWellQuery it would work, but only if a component is actively using the query.
      // TODO: Do the same for the wellbores/objects.
      // - Connected to  TODO: For now, we are refreshing the entire list. See comment for refreshObjectQuery in queryRefreshHelpers.tsx.
      // If we find a solution, we should use refreshObjectQuery with the objectUid instead.
      // - Create own issue, connecting both TODOs
    }
  }

  async function refreshWellbore(refreshAction: RefreshAction) {
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

  async function refreshWellboreObject(refreshAction: RefreshAction) {
    refreshObjectQuery(
      queryClient,
      refreshAction.serverUrl.toString().toLowerCase(),
      refreshAction.wellUid,
      refreshAction.wellboreUid,
      refreshAction.entityType as ObjectType,
      refreshAction.objectUid
    );
  }

  async function refreshWellboreObjects(refreshAction: RefreshAction) {
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
