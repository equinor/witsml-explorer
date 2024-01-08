import { RemoveWellboreAction } from "contexts/modificationActions";
import ModificationType from "contexts/modificationType";
import NavigationContext from "contexts/navigationContext";
import EntityType from "models/entityType";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import {
  getObjectsFromWellbore,
  objectTypeToWellboreObjects
} from "models/wellbore";
import React, { useContext, useEffect } from "react";
import NotificationService, {
  RefreshAction
} from "services/notificationService";
import ObjectService from "services/objectService";
import WellService from "services/wellService";
import WellboreService from "services/wellboreService";

const RefreshHandler = (): React.ReactElement => {
  const {
    dispatchNavigation,
    navigationState: { wells, selectedServer }
  } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe =
      NotificationService.Instance.refreshDispatcher.subscribe(
        async (refreshAction: RefreshAction) => {
          const shouldTryRefresh =
            refreshAction?.serverUrl.toString().toLowerCase() ===
            selectedServer?.url?.toLowerCase();
          if (!shouldTryRefresh) {
            return;
          }

          //do not refresh if attempting to refresh objects on a wellbore that has not been opened
          if (
            refreshAction.entityType != EntityType.Well &&
            refreshAction.entityType != EntityType.Wellbore
          ) {
            const wellbore = wells
              ?.find((well) => well.uid === refreshAction.wellUid)
              ?.wellbores?.find(
                (wellbore) => wellbore.uid === refreshAction.wellboreUid
              );
            if (wellbore == null) {
              return;
            }
            if (
              getObjectsFromWellbore(
                wellbore,
                refreshAction.entityType as ObjectType
              ) == null
            ) {
              return;
            }
          }

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
  }, [selectedServer, wells]);

  async function refreshWell(
    refreshAction: RefreshAction,
    modificationType: ModificationType
  ) {
    if (modificationType === ModificationType.RemoveWell) {
      dispatchNavigation({
        type: ModificationType.RemoveWell,
        payload: { wellUid: refreshAction.wellUid }
      });
    } else if (
      modificationType === ModificationType.AddWell ||
      modificationType === ModificationType.UpdateWell
    ) {
      const well = await WellService.getWell(refreshAction.wellUid);
      if (well) {
        dispatchNavigation({ type: modificationType, payload: { well } });
      }
    } else if (modificationType === ModificationType.BatchUpdateWell) {
      const wells = await WellService.getWells();
      if (wells) {
        dispatchNavigation({
          type: ModificationType.UpdateWells,
          payload: { wells }
        });
      }
    }
  }

  async function refreshWellbore(
    refreshAction: RefreshAction,
    modificationType: ModificationType
  ) {
    if (modificationType === ModificationType.RemoveWellbore) {
      const action: RemoveWellboreAction = {
        type: ModificationType.RemoveWellbore,
        payload: {
          wellUid: refreshAction.wellUid,
          wellboreUid: refreshAction.wellboreUid
        }
      };
      dispatchNavigation(action);
    } else if (modificationType === ModificationType.AddWellbore) {
      const wellbore = await WellboreService.getWellbore(
        refreshAction.wellUid,
        refreshAction.wellboreUid
      );
      if (wellbore) {
        dispatchNavigation({ type: modificationType, payload: { wellbore } });
      }
    } else if (modificationType === ModificationType.UpdateWellbore) {
      const wellbore = await WellboreService.getWellbore(
        refreshAction.wellUid,
        refreshAction.wellboreUid
      );
      const previousWellbore = wells
        ?.find((well) => well.uid === refreshAction.wellUid)
        ?.wellbores?.find(
          (wellbore) => wellbore.uid === refreshAction.wellboreUid
        );
      if (previousWellbore) {
        // keep the wellbore objects that have been already loaded in
        Object.values(ObjectType).forEach((objectType) => {
          const label = objectTypeToWellboreObjects(objectType);
          // @ts-ignore
          wellbore[label] = previousWellbore[label];
        });
        wellbore.objectCount = previousWellbore.objectCount;
      }
      dispatchNavigation({
        type: ModificationType.UpdateWellbore,
        payload: { wellbore }
      });
    }
  }

  async function refreshWellboreObject(refreshAction: RefreshAction) {
    const objectToUpdate = await ObjectService.getObject(
      refreshAction.wellUid,
      refreshAction.wellboreUid,
      refreshAction.objectUid,
      refreshAction.entityType as ObjectType
    );
    dispatchNavigation({
      type: ModificationType.UpdateWellboreObject,
      payload: objectToUpdate
        ? {
            objectToUpdate,
            objectType: refreshAction.entityType as ObjectType,
            isDeleted: false
          }
        : {
            objectToUpdate: {
              uid: refreshAction.objectUid,
              wellboreUid: refreshAction.wellboreUid,
              wellUid: refreshAction.wellUid
            } as ObjectOnWellbore,
            objectType: refreshAction.entityType as ObjectType,
            isDeleted: true
          }
    });
  }

  async function refreshWellboreObjects(refreshAction: RefreshAction) {
    const objectType = refreshAction.entityType as ObjectType;
    const wellboreObjects = await ObjectService.getObjects(
      refreshAction.wellUid,
      refreshAction.wellboreUid,
      objectType
    );
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (wellboreObjects) {
      dispatchNavigation({
        type: ModificationType.UpdateWellboreObjects,
        payload: { wellboreObjects, wellUid, wellboreUid, objectType }
      });
    }
  }

  return <></>;
};

export default RefreshHandler;
