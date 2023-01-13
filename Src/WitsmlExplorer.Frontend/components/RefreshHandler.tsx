import React, { useContext, useEffect } from "react";
import { RemoveWellboreAction } from "../contexts/modificationActions";
import ModificationType from "../contexts/modificationType";
import NavigationContext from "../contexts/navigationContext";
import EntityType from "../models/entityType";
import BhaRunService from "../services/bhaRunService";
import LogObjectService from "../services/logObjectService";
import MessageObjectService from "../services/messageObjectService";
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
            await refreshBhaRuns(refreshAction, modificationType);
            break;
          case EntityType.LogObject:
            await refreshLogObject(refreshAction, modificationType);
            break;
          case EntityType.LogObjects:
            await refreshLogObjects(refreshAction, ModificationType.UpdateLogObjects);
            break;
          case EntityType.MessageObjects:
            await refreshMessageObjects(refreshAction, modificationType);
            break;
          case EntityType.Trajectory:
            await refreshTrajectory(refreshAction, ModificationType.UpdateTrajectoryOnWellbore);
            break;
          case EntityType.Trajectories:
            await refreshTrajectories(refreshAction, ModificationType.UpdateTrajectoriesOnWellbore);
            break;
          case EntityType.Tubular:
            await refreshTubulars(refreshAction, ModificationType.UpdateTubularsOnWellbore);
            break;
          case EntityType.Risks:
            await refreshRisks(refreshAction, ModificationType.UpdateRiskObjects);
            break;
          case EntityType.Rigs:
            await refreshRigs(refreshAction, ModificationType.UpdateRigsOnWellbore);
            break;
          case EntityType.WbGeometry:
            await refreshWbGeometry(refreshAction, ModificationType.UpdateWbGeometryOnWellbore);
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

  async function refreshBhaRuns(refreshAction: RefreshAction, modificationType: ModificationType) {
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

  async function refreshLogObjects(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateLogObjects) {
      const logs = await LogObjectService.getLogs(refreshAction.wellUid, refreshAction.wellboreUid);
      if (logs) {
        dispatchNavigation({ type: modificationType, payload: { logs, wellUid: refreshAction.wellUid, wellboreUid: refreshAction.wellboreUid } });
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

  async function refreshRisks(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateRiskObjects) {
      const risks = await RiskObjectService.getRisks(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (risks) {
        dispatchNavigation({ type: modificationType, payload: { risks, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshTubulars(refreshAction: RefreshAction, modificationType: ModificationType) {
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

  async function refreshTrajectories(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateTrajectoriesOnWellbore) {
      const trajectories = await TrajectoryService.getTrajectories(refreshAction.wellUid, refreshAction.wellboreUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (trajectories) {
        dispatchNavigation({ type: modificationType, payload: { trajectories, wellUid, wellboreUid } });
      }
    }
  }

  async function refreshWbGeometry(refreshAction: RefreshAction, modificationType: ModificationType) {
    if (modificationType === ModificationType.UpdateWbGeometryOnWellbore) {
      const wbGeometry = await WbGeometryObjectService.getWbGeometry(refreshAction.wellUid, refreshAction.wellboreUid, refreshAction.wbGeometryUid);
      const wellUid = refreshAction.wellUid;
      const wellboreUid = refreshAction.wellboreUid;
      if (wbGeometry) {
        dispatchNavigation({ type: modificationType, payload: { wbGeometry, wellUid, wellboreUid } });
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
