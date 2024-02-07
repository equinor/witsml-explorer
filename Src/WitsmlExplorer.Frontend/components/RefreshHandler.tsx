import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import ModificationType from "../contexts/modificationType";
import {
  refreshWellQuery,
  refreshWellboreQuery,
  refreshWellboresQuery,
  refreshWellsQuery
} from "../hooks/query/queryRefreshHelpers";
import EntityType from "../models/entityType";
import { ObjectType } from "../models/objectType";
import NotificationService, {
  RefreshAction
} from "../services/notificationService";

const RefreshHandler = (): React.ReactElement => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe =
      NotificationService.Instance.refreshDispatcher.subscribe(
        async (refreshAction: RefreshAction) => {
          try {
            const modificationType: ModificationType =
              // @ts-ignore
              ModificationType[
                `${refreshAction.refreshType}${refreshAction.entityType}`
              ];
            switch (refreshAction.entityType) {
              case EntityType.Well:
                await refreshWell(refreshAction, modificationType);
                break;
              case EntityType.Wellbore:
                await refreshWellbore(refreshAction, modificationType);
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

  async function refreshWell(
    refreshAction: RefreshAction,
    modificationType: ModificationType
  ) {
    if (modificationType === ModificationType.UpdateWell) {
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
    }
  }

  async function refreshWellbore(
    refreshAction: RefreshAction,
    modificationType: ModificationType
  ) {
    if (modificationType === ModificationType.UpdateWellbore) {
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
    // TODO: Invalidate the query for the specific object.
    console.log(refreshAction);
  }

  async function refreshWellboreObjects(refreshAction: RefreshAction) {
    // TODO: Invalidate the query for the specific objects.
    console.log(refreshAction);
  }

  return <></>;
};

export default RefreshHandler;
