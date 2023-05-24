import React, { useContext, useEffect } from "react";
import { RemoveWellboreAction } from "../contexts/modificationActions";
import ModificationType from "../contexts/modificationType";
import NavigationContext from "../contexts/navigationContext";
import EntityType from "../models/entityType";
import { ObjectType } from "../models/objectType";
import { getObjectsFromWellbore } from "../models/wellbore";
import NotificationService, { RefreshAction } from "../services/notificationService";
import ObjectService from "../services/objectService";
import WellService from "../services/wellService";
import WellboreService from "../services/wellboreService";

const RefreshHandler = (): React.ReactElement => {
  const {
    dispatchNavigation,
    navigationState: { wells, selectedServer }
  } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.refreshDispatcher.subscribe(async (refreshAction: RefreshAction) => {
      const shouldTryRefresh = refreshAction?.serverUrl.toString() === selectedServer?.url;
      if (!shouldTryRefresh) {
        return;
      }

      //do not refresh if attempting to refresh objects on a wellbore that has not been opened
      if (refreshAction.entityType != EntityType.Well && refreshAction.entityType != EntityType.Wellbore) {
        const wellbore = wells?.find((well) => well.uid === refreshAction.wellUid)?.wellbores?.find((wellbore) => wellbore.uid === refreshAction.wellboreUid);
        if (wellbore == null) {
          return;
        }
        if (getObjectsFromWellbore(wellbore, refreshAction.entityType as ObjectType) == null) {
          return;
        }
      }

      try {
        // @ts-ignore
        const modificationType: ModificationType = ModificationType[`${refreshAction.refreshType}${refreshAction.entityType}`];
        // the following switch-case can be simplified once we have a generic refresh of a single object
        switch (refreshAction.entityType) {
          case EntityType.Well:
            await refreshWell(refreshAction, modificationType);
            break;
          case EntityType.Wellbore:
            await refreshWellbore(refreshAction, modificationType);
            break;
          case EntityType.BhaRun:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.FluidsReport:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.FormationMarker:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.Log:
            if (refreshAction.objectUid == null) {
              await refreshWellboreObjects(refreshAction);
            } else {
              await refreshLogObject(refreshAction);
            }
            break;
          case EntityType.Message:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.MudLog:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.Trajectory:
            if (refreshAction.objectUid == null) {
              await refreshWellboreObjects(refreshAction);
            } else {
              await refreshTrajectory(refreshAction);
            }
            break;
          case EntityType.Tubular:
            if (refreshAction.objectUid == null) {
              await refreshWellboreObjects(refreshAction);
            } else {
              await refreshTubular(refreshAction);
            }
            break;
          case EntityType.Risk:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.Rig:
            await refreshWellboreObjects(refreshAction);
            break;
          case EntityType.WbGeometry:
            if (refreshAction.objectUid == null) {
              await refreshWellboreObjects(refreshAction);
            } else {
              await refreshWbGeometry(refreshAction);
            }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Unable to perform refresh action for action: ${refreshAction.refreshType} and entity: ${refreshAction.entityType}`);
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, [selectedServer, wells]);

  async function refreshWell(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.RemoveWell) {
      dispatchNavigation({ type: ModificationType.RemoveWell, payload: { wellUid: refreshAction.wellUid } });
    } else if (modificationType === ModificationType.AddWell || modificationType === ModificationType.UpdateWell) {
      const well = await WellService.getWell(refreshAction.wellUid);
      if (well) {
        dispatchNavigation({ type: modificationType, payload: { well } });
      }
    } else if (modificationType === ModificationType.BatchUpdateWell) {
      const wells = await WellService.getWells();
      if (wells) {
        dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells } });
      }
    }
  }

  async function refreshWellbore(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.RemoveWellbore) {
      const action: RemoveWellboreAction = { type: ModificationType.RemoveWellbore, payload: { wellUid: refreshAction.wellUid, wellboreUid: refreshAction.wellboreUid } };
      dispatchNavigation(action);
    } else if (modificationType === ModificationType.AddWellbore) {
      const wellbore = await WellboreService.getWellbore(refreshAction.wellUid, refreshAction.wellboreUid);
      if (wellbore) {
        dispatchNavigation({ type: modificationType, payload: { wellbore } });
      }
    } else if (modificationType === ModificationType.UpdateWellbore) {
      const wellbore = await WellboreService.getCompleteWellbore(refreshAction.wellUid, refreshAction.wellboreUid);
      dispatchNavigation({
        type: ModificationType.UpdateWellbore,
        payload: { wellbore }
      });
    }
  }

  async function refreshLogObject(refreshAction: RefreshAction) {
    const log = await ObjectService.getObject(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid, ObjectType.Log);
    if (log) {
      dispatchNavigation({ type: ModificationType.UpdateLogObject, payload: { log } });
    }
  }

  async function refreshTubular(refreshAction: RefreshAction) {
    const tubular = await ObjectService.getObject(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid, ObjectType.Tubular);
    if (tubular) {
      dispatchNavigation({ type: ModificationType.UpdateTubularOnWellbore, payload: { tubular, exists: true } });
    }
  }

  async function refreshTrajectory(refreshAction: RefreshAction) {
    const trajectory = await ObjectService.getObject(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid, ObjectType.Trajectory);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (trajectory) {
      dispatchNavigation({ type: ModificationType.UpdateTrajectoryOnWellbore, payload: { trajectory, wellUid, wellboreUid } });
    }
  }

  async function refreshWbGeometry(refreshAction: RefreshAction) {
    const wbGeometry = await ObjectService.getObject(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid, ObjectType.WbGeometry);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (wbGeometry) {
      dispatchNavigation({ type: ModificationType.UpdateWbGeometryOnWellbore, payload: { wbGeometry, wellUid, wellboreUid } });
    }
  }

  async function refreshWellboreObjects(refreshAction: RefreshAction) {
    const objectType = refreshAction.entityType as ObjectType;
    const wellboreObjects = await ObjectService.getObjects(refreshAction.wellUid, refreshAction.wellboreUid, objectType);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (wellboreObjects) {
      dispatchNavigation({ type: ModificationType.UpdateWellboreObjects, payload: { wellboreObjects, wellUid, wellboreUid, objectType } });
    }
  }

  return <></>;
};

export default RefreshHandler;
