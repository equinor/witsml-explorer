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
import MessageObjectService from "../services/messageObjectService";
import TubularService from "../services/tubularService";
import RiskObjectService from "../services/riskObjectService";
import RigService from "../services/rigService";
import TrajectoryService from "../services/trajectoryService";
import WbGeometryObjectService from "../services/wbGeometryService";
import BhaRunService from "../services/bhaRunService";

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
          case EntityType.BhaRuns:
            await refreshBhaRun(refreshAction, modificationType);
            break;
          case EntityType.LogObject:
            await refreshLogObject(refreshAction, modificationType);
            break;
          case EntityType.MessageObjects:
            await refreshMessageObjects(refreshAction, modificationType);
            break;
          case EntityType.Trajectory:
            await refreshTrajectory(refreshAction, ModificationType.UpdateTrajectoryOnWellbore);
            break;
          case EntityType.Tubular:
            await refreshTubular(refreshAction, ModificationType.UpdateTubularsOnWellbore);
            break;
          case EntityType.Risks:
            await refreshRisk(refreshAction, ModificationType.UpdateRiskObjects);
            break;
          case EntityType.Rigs:
            await refreshRigs(refreshAction, ModificationType.UpdateRigsOnWellbore);
            break;
          case EntityType.WbGeometryObjects:
            await refreshWbGeometryObjects(refreshAction, ModificationType.UpdateWbGeometryObjects);
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

  async function refreshBhaRun(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateBhaRuns) {
      const bhaRuns = await BhaRunService.getBhaRuns(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (bhaRuns) {
        dispatchNavigation({ type: modificationType, payload: { bhaRuns, wellUid, wellboreUid } });
      }
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

  async function refreshMessageObjects(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateMessageObjects) {
      const messages = await MessageObjectService.getMessages(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (messages) {
        dispatchNavigation({ type: modificationType, payload: { messages, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshRigs(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateRigsOnWellbore) {
      const rigs = await RigService.getRigs(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (rigs) {
        dispatchNavigation({ type: modificationType, payload: { rigs, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshRisk(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateRiskObjects) {
      const risks = await RiskObjectService.getRisks(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (risks) {
        dispatchNavigation({ type: modificationType, payload: { risks, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshTubular(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateTubularsOnWellbore) {
      const tubulars = await TubularService.getTubulars(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (tubulars) {
        dispatchNavigation({ type: modificationType, payload: { tubulars, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshTrajectory(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateTrajectoryOnWellbore) {
      const trajectory = await TrajectoryService.getTrajectory(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.trajectoryUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (trajectory) {
        dispatchNavigation({ type: modificationType, payload: { trajectory, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshWbGeometryObjects(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateWbGeometryObjects) {
      const wbGeometrys = await WbGeometryObjectService.getWbGeometrys(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (wbGeometrys) {
        dispatchNavigation({ type: modificationType, payload: { wbGeometrys, wellUid, wellboreUid } });
      }
    }
  }

  return <></>;
};

export default RefreshHandler;
