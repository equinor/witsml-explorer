import React, { useContext, useEffect } from "react";
import { RemoveWellboreAction } from "../contexts/modificationActions";
import ModificationType from "../contexts/modificationType";
import NavigationContext from "../contexts/navigationContext";
import EntityType from "../models/entityType";
import BhaRunService from "../services/bhaRunService";
import LogObjectService from "../services/logObjectService";
import MessageObjectService from "../services/messageObjectService";
import MudLogService from "../services/mudLogService";
import NotificationService, { RefreshAction } from "../services/notificationService";
import RigService from "../services/rigService";
import RiskObjectService from "../services/riskObjectService";
import TrajectoryService from "../services/trajectoryService";
import TubularService from "../services/tubularService";
import WbGeometryObjectService from "../services/wbGeometryService";
import WellboreService from "../services/wellboreService";
import WellService from "../services/wellService";

const RefreshHandler = (): React.ReactElement => {
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.refreshDispatcher.subscribe(async (refreshAction: RefreshAction) => {
      const shouldTryRefresh = refreshAction?.serverUrl.toString() === navigationState.selectedServer?.url;
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
            await refreshBhaRuns(refreshAction);
            break;
          case EntityType.LogObject:
            await refreshLogObject(refreshAction);
            break;
          case EntityType.LogObjects:
            await refreshLogObjects(refreshAction);
            break;
          case EntityType.Messages:
            await refreshMessageObjects(refreshAction);
            break;
          case EntityType.MudLogs:
            await refreshMudLogs(refreshAction);
            break;
          case EntityType.Trajectory:
            await refreshTrajectory(refreshAction);
            break;
          case EntityType.Trajectories:
            await refreshTrajectories(refreshAction);
            break;
          case EntityType.Tubular:
            await refreshTubular(refreshAction);
            break;
          case EntityType.Tubulars:
            await refreshTubulars(refreshAction);
            break;
          case EntityType.Risks:
            await refreshRisks(refreshAction);
            break;
          case EntityType.Rigs:
            await refreshRigs(refreshAction);
            break;
          case EntityType.WbGeometry:
            await refreshWbGeometry(refreshAction);
            break;
          case EntityType.WbGeometries:
            await refreshWbGeometryObjects(refreshAction);
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

  async function refreshBhaRuns(refreshAction: RefreshAction) {
    const bhaRuns = await BhaRunService.getBhaRuns(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (bhaRuns) {
      dispatchNavigation({ type: ModificationType.UpdateBhaRuns, payload: { bhaRuns, wellUid, wellboreUid } });
    }
  }

  async function refreshLogObject(refreshAction: RefreshAction) {
    const log = await LogObjectService.getLog(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid);
    if (log) {
      dispatchNavigation({ type: ModificationType.UpdateLogObject, payload: { log } });
    }
  }

  async function refreshLogObjects(refreshAction: RefreshAction) {
    const logs = await LogObjectService.getLogs(refreshAction.wellUid, refreshAction.wellboreUid);
    if (logs) {
      dispatchNavigation({ type: ModificationType.UpdateLogObjects, payload: { logs, wellUid: refreshAction.wellUid, wellboreUid: refreshAction.wellboreUid } });
    }
  }

  async function refreshMessageObjects(refreshAction: RefreshAction) {
    const messages = await MessageObjectService.getMessages(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (messages) {
      dispatchNavigation({ type: ModificationType.UpdateMessageObjects, payload: { messages, wellUid, wellboreUid } });
    }
  }

  async function refreshMudLogs(refreshAction: RefreshAction) {
    const mudLogs = await MudLogService.getMudLogs(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (mudLogs) {
      dispatchNavigation({ type: ModificationType.UpdateMudLogs, payload: { mudLogs, wellUid, wellboreUid } });
    }
  }

  async function refreshRigs(refreshAction: RefreshAction) {
    const rigs = await RigService.getRigs(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (rigs) {
      dispatchNavigation({ type: ModificationType.UpdateRigsOnWellbore, payload: { rigs, wellUid, wellboreUid } });
    }
  }

  async function refreshRisks(refreshAction: RefreshAction) {
    const risks = await RiskObjectService.getRisks(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (risks) {
      dispatchNavigation({ type: ModificationType.UpdateRiskObjects, payload: { risks, wellUid, wellboreUid } });
    }
  }

  async function refreshTubular(refreshAction: RefreshAction) {
    const tubular = await TubularService.getTubular(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid);
    if (tubular) {
      dispatchNavigation({ type: ModificationType.UpdateTubularOnWellbore, payload: { tubular, exists: true } });
    }
  }

  async function refreshTubulars(refreshAction: RefreshAction) {
    const tubulars = await TubularService.getTubulars(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (tubulars) {
      dispatchNavigation({ type: ModificationType.UpdateTubularsOnWellbore, payload: { tubulars, wellUid, wellboreUid } });
    }
  }

  async function refreshTrajectory(refreshAction: RefreshAction) {
    const trajectory = await TrajectoryService.getTrajectory(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (trajectory) {
      dispatchNavigation({ type: ModificationType.UpdateTrajectoryOnWellbore, payload: { trajectory, wellUid, wellboreUid } });
    }
  }

  async function refreshTrajectories(refreshAction: RefreshAction) {
    const trajectories = await TrajectoryService.getTrajectories(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (trajectories) {
      dispatchNavigation({ type: ModificationType.UpdateTrajectoriesOnWellbore, payload: { trajectories, wellUid, wellboreUid } });
    }
  }

  async function refreshWbGeometry(refreshAction: RefreshAction) {
    const wbGeometry = await WbGeometryObjectService.getWbGeometry(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.objectUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (wbGeometry) {
      dispatchNavigation({ type: ModificationType.UpdateWbGeometryOnWellbore, payload: { wbGeometry, wellUid, wellboreUid } });
    }
  }

  async function refreshWbGeometryObjects(refreshAction: RefreshAction) {
    const wbGeometrys = await WbGeometryObjectService.getWbGeometrys(refreshAction.wellUid, refreshAction.wellboreUid);
    const wellUid = refreshAction.wellUid;
    const wellboreUid = refreshAction.wellboreUid;
    if (wbGeometrys) {
      dispatchNavigation({ type: ModificationType.UpdateWbGeometryObjects, payload: { wbGeometrys, wellUid, wellboreUid } });
    }
  }

  return <></>;
};

export default RefreshHandler;
