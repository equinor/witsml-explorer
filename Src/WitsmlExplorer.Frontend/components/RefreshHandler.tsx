import { useQueryClient } from "@tanstack/react-query";
import {
  refreshObjectQuery,
  refreshObjectsQuery,
  refreshSearchQuery,
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
          } catch (e) {
            console.error(
              `Unable to perform refresh action for action: ${refreshAction.refreshType} and entity: ${refreshAction.entityType}`,
              e
            );
          }
        }
      );

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  function refreshWell(refreshAction: RefreshAction) {
    refreshWellsQuery(
      queryClient,
      refreshAction.serverUrl.toString().toLowerCase()
    );
  }

  function refreshWellbore(refreshAction: RefreshAction) {
    refreshWellboresQuery(
      queryClient,
      refreshAction.serverUrl.toString().toLowerCase(),
      refreshAction.wellUid
    );
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
    const uniqueMap = new Map<
      string,
      { wellUid: string; wellboreUid: string }
    >();

    refreshAction.objects.forEach((obj) => {
      const key = `${obj.wellUid}_${obj.wellboreUid}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          wellUid: obj.wellUid,
          wellboreUid: obj.wellboreUid
        });
      }
    });

    const uniqueCombinations = Array.from(uniqueMap.values());

    for (const obj of uniqueCombinations) {
      refreshObjectsQuery(
        queryClient,
        refreshAction.serverUrl.toString().toLowerCase(),
        obj.wellUid,
        obj.wellboreUid,
        refreshAction.entityType as ObjectType
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
