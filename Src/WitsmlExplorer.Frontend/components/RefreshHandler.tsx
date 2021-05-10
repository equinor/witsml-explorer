import React, { useContext, useEffect } from "react";
import NotificationService, { RefreshAction } from "../services/notificationService";
import CredentialsService from "../services/credentialsService";
import WellService from "../services/wellService";
import WellboreService from "../services/wellboreService";
import NavigationContext from "../contexts/navigationContext";
import LogObjectService from "../services/logObjectService";
import EntityType from "../models/entityType";
import ModificationType from "../contexts/modificationType";
import { RemoveWellboreAction } from "../contexts/navigationStateReducer";

const RefreshHandler = (): React.ReactElement => {
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.refreshDispatcher.subscribe(async (refreshAction) => {
      const loggedIn = CredentialsService.hasPasswordForServer(navigationState.selectedServer);
      const shouldTryRefresh = refreshAction?.serverUrl.toString() === navigationState.selectedServer?.url && loggedIn;
      if (!shouldTryRefresh) {
        return;
      }
      try {
        // @ts-ignore
        const modificationType: ModificationType = ModificationType[`${refreshAction.refreshType}${refreshAction.entityType}`];
        switch (refreshAction.entityType) {
          case EntityType.Well:
            await refreshWell(refreshAction, modificationType);
            break;
          case EntityType.Wellbore:
            await refreshWellbore(refreshAction, modificationType);
            break;
          case EntityType.LogObject:
            await refreshLogObject(refreshAction, modificationType);
            break;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Unable to perform refresh action for action: ${refreshAction.refreshType} and entity: ${refreshAction.entityType}`);
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, [navigationState.selectedServer]);

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

  async function refreshLogObject(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateLogObject) {
      const log = await LogObjectService.getLog(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.logObjectUid);
      if (log) {
        dispatchNavigation({ type: modificationType, payload: { log } });
      }
    }
  }

  return <></>;
};

export default RefreshHandler;
