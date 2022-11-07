import { NextRouter, useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../contexts/navigationContext";
import {
  NavigationAction,
  NavigationState,
  SelectBhaRunGroupAction,
  SelectLogObjectAction,
  SelectMessageGroupAction,
  SelectRigGroupAction,
  SelectRiskGroupAction,
  SelectServerAction,
  SelectTrajectoryAction,
  SelectTubularAction,
  SelectWbGeometryAction,
  SelectWellAction,
  SelectWellboreAction,
  SetFilterAction
} from "../contexts/navigationStateReducer";
import NavigationType from "../contexts/navigationType";
import BhaRun from "../models/bhaRun";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import { Server } from "../models/server";
import Trajectory from "../models/trajectory";
import Tubular from "../models/tubular";
import WbGeometryObject from "../models/wbGeometry";
import Well from "../models/well";
import Wellbore, {
  calculateBhaRunGroupId,
  calculateMessageGroupId,
  calculateRigGroupId,
  calculateRiskGroupId,
  calculateTrajectoryGroupId,
  calculateTubularGroupId,
  calculateWbGeometryGroupId
} from "../models/wellbore";
import { truncateAbortHandler } from "../services/apiClient";
import BhaRunService from "../services/bhaRunService";
import CredentialsService from "../services/credentialsService";
import LogObjectService from "../services/logObjectService";
import MessageObjectService from "../services/messageObjectService";
import RigService from "../services/rigService";
import RiskObjectService from "../services/riskObjectService";
import TrajectoryService from "../services/trajectoryService";
import TubularService from "../services/tubularService";
import WbGeometryObjectService from "../services/wbGeometryService";

const Routing = (): React.ReactElement => {
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const {
    selectedServer,
    servers,
    wells,
    selectedWell,
    selectedWellbore,
    selectedLog,
    selectedTubular,
    selectedBhaRunGroup,
    selectedMessageGroup,
    selectedRigGroup,
    selectedRiskGroup,
    selectedTrajectory,
    selectedWbGeometryGroup
  } = navigationState;
  const router = useRouter();
  const [isSyncingUrlAndState, setIsSyncingUrlAndState] = useState<boolean>(true);
  const [queryParamsFromUrl, setQueryParamsFromUrl] = useState<QueryParams>(null);
  const [currentQueryParams, setCurrentQueryParams] = useState<QueryParams>(null);
  useEffect(() => {
    if (isSyncingUrlAndState) {
      setQueryParamsFromUrl(getQueryParamsFromUrl(router));
      setCurrentQueryParams(getQueryParamsFromState(navigationState));
    }
  }, [router]);

  useEffect(() => {
    setCurrentQueryParams(getQueryParamsFromState(navigationState));
    const finishedSyncingStateAndUrl = isSyncingUrlAndState && queryParamsFromUrl && isQueryParamsEqual(queryParamsFromUrl, currentQueryParams);
    if (finishedSyncingStateAndUrl) {
      setIsSyncingUrlAndState(false);
    }
  }, [
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedLog,
    selectedTubular,
    selectedBhaRunGroup,
    selectedMessageGroup,
    selectedRigGroup,
    selectedRiskGroup,
    selectedTrajectory,
    selectedWbGeometryGroup
  ]);

  useEffect(() => {
    if (!isSyncingUrlAndState) {
      router.push({
        pathname: "/",
        query: { ...currentQueryParams }
      });
    }
  }, [currentQueryParams, isSyncingUrlAndState]);

  useEffect(() => {
    if (isSyncingUrlAndState && queryParamsFromUrl) {
      const serverUrl = router.query.serverUrl;
      const server = servers.find((server: Server) => server.url === serverUrl);
      if (server && !selectedServer) {
        const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server } };
        dispatchNavigation(action);
        CredentialsService.setSelectedServer(server);
      }
    }
  }, [servers, queryParamsFromUrl]);

  useEffect(() => {
    if (isSyncingUrlAndState) {
      const wellUid = router.query.wellUid;
      if (wellUid && !selectedWell && wells.length > 0) {
        const well: Well = wells.find((w: Well) => w.uid === wellUid);
        if (well) {
          const selectWellAction: SelectWellAction = { type: NavigationType.SelectWell, payload: { well, wellbores: well.wellbores } };
          dispatchNavigation(selectWellAction);
        } else {
          setIsSyncingUrlAndState(false);
        }
      }
    }
  }, [wells]);

  useEffect(() => {
    if (isSyncingUrlAndState && selectedWell) {
      const setFilterAction: SetFilterAction = { type: NavigationType.SetFilter, payload: { filter: { ...navigationState.selectedFilter, wellName: selectedWell.name } } };
      dispatchNavigation(setFilterAction);
    }
  }, [selectedWell]);

  useEffect(() => {
    const wellboreUid = router.query.wellboreUid?.toString();
    const controller = new AbortController();

    async function getChildren() {
      const getBhaRuns = BhaRunService.getBhaRuns(selectedWell.uid, wellboreUid, controller.signal);
      const getLogs = LogObjectService.getLogs(selectedWell.uid, wellboreUid, controller.signal);
      const getRigs = RigService.getRigs(selectedWell.uid, wellboreUid, controller.signal);
      const getTrajectories = TrajectoryService.getTrajectories(selectedWell.uid, wellboreUid, controller.signal);
      const getTubulars = TubularService.getTubulars(selectedWell.uid, wellboreUid, controller.signal);
      const getMessages = MessageObjectService.getMessages(selectedWell.uid, wellboreUid, controller.signal);
      const getRisks = RiskObjectService.getRisks(selectedWell.uid, wellboreUid, controller.signal);
      const getWbGeometrys = WbGeometryObjectService.getWbGeometrys(selectedWell.uid, wellboreUid, controller.signal);
      const [bhaRuns, logs, rigs, trajectories, messages, risks, tubulars, wbGeometrys] = await Promise.all([
        getBhaRuns,
        getLogs,
        getRigs,
        getTrajectories,
        getMessages,
        getRisks,
        getTubulars,
        getWbGeometrys
      ]);
      const wellbore: Wellbore = selectedWell.wellbores.find((wb: Wellbore) => wb.uid === wellboreUid);
      if (wellbore) {
        const selectWellbore: SelectWellboreAction = {
          type: NavigationType.SelectWellbore,
          payload: { well: selectedWell, wellbore, bhaRuns, logs, rigs, trajectories, messages, risks, tubulars, wbGeometrys }
        } as SelectWellboreAction;
        dispatchNavigation(selectWellbore);
      } else {
        setIsSyncingUrlAndState(false);
      }
    }

    const shouldNavigateToWellbore = isSyncingUrlAndState && selectedWell && wellboreUid && !selectedWellbore;
    if (shouldNavigateToWellbore) {
      getChildren().catch(truncateAbortHandler);
      return () => {
        controller.abort();
      };
    }
  }, [selectedWell]);

  useEffect(() => {
    if (isSyncingUrlAndState) {
      const dispatch = (object: any, action: NavigationAction) => {
        if (object) {
          dispatchNavigation(action);
        } else {
          setIsSyncingUrlAndState(false);
        }
      };

      const bhaRunUid = router.query.bhaRunUid?.toString();
      if (selectedWellbore && bhaRunUid && !selectedBhaRunGroup) {
        const bhaRun = selectedWellbore.bhaRuns.find((object: BhaRun) => object.uid === bhaRunUid);
        const action: SelectBhaRunGroupAction = {
          type: NavigationType.SelectBhaRunGroup,
          payload: { bhaRunGroup: calculateBhaRunGroupId(selectedWellbore), well: selectedWell, wellbore: selectedWellbore }
        };
        dispatch(bhaRun, action);
      }

      const logObjectUid = router.query.logObjectUid?.toString();
      if (selectedWellbore && logObjectUid && !selectedLog) {
        const log = selectedWellbore.logs.find((l: LogObject) => l.uid === logObjectUid);
        const selectLogObjectAction: SelectLogObjectAction = { type: NavigationType.SelectLogObject, payload: { log, well: selectedWell, wellbore: selectedWellbore } };
        dispatch(log, selectLogObjectAction);
      }

      const messageUid = router.query.messageUid?.toString();
      if (selectedWellbore && messageUid && !selectedMessageGroup) {
        const message = selectedWellbore.messages.find((object: MessageObject) => object.uid === messageUid);
        const action: SelectMessageGroupAction = {
          type: NavigationType.SelectMessageGroup,
          payload: { messageGroup: calculateMessageGroupId(selectedWellbore), well: selectedWell, wellbore: selectedWellbore }
        };
        dispatch(message, action);
      }

      const rigUid = router.query.rigUid?.toString();
      if (selectedWellbore && rigUid && !selectedRigGroup) {
        const rig = selectedWellbore.rigs.find((object: Rig) => object.uid === rigUid);
        const action: SelectRigGroupAction = {
          type: NavigationType.SelectRigGroup,
          payload: { rigGroup: calculateRigGroupId(selectedWellbore), well: selectedWell, wellbore: selectedWellbore }
        };
        dispatch(rig, action);
      }

      const riskUid = router.query.riskUid?.toString();
      if (selectedWellbore && riskUid && !selectedRiskGroup) {
        const risk = selectedWellbore.risks.find((object: RiskObject) => object.uid === riskUid);
        const action: SelectRiskGroupAction = {
          type: NavigationType.SelectRiskGroup,
          payload: { riskGroup: calculateRiskGroupId(selectedWellbore), well: selectedWell, wellbore: selectedWellbore }
        };
        dispatch(risk, action);
      }

      const trajectoryUid = router.query.trajectoryUid?.toString();
      if (selectedWellbore && trajectoryUid && !selectedTrajectory) {
        const trajectory = selectedWellbore.trajectories.find((t: Trajectory) => t.uid === trajectoryUid);
        const selectTrajectoryAction: SelectTrajectoryAction = {
          type: NavigationType.SelectTrajectory,
          payload: { well: selectedWell, wellbore: selectedWellbore, trajectoryGroup: calculateTrajectoryGroupId(selectedWellbore), trajectory }
        };
        dispatch(trajectory, selectTrajectoryAction);
      }

      const tubularUid = router.query.tubularUid?.toString();
      if (selectedWellbore && tubularUid && !selectedTubular) {
        const tubular = selectedWellbore.tubulars.find((t: Tubular) => t.uid === tubularUid);
        const selectTubularAction: SelectTubularAction = {
          type: NavigationType.SelectTubular,
          payload: { well: selectedWell, wellbore: selectedWellbore, tubularGroup: calculateTubularGroupId(selectedWellbore), tubular }
        };
        dispatch(tubular, selectTubularAction);
      }

      const wbGeometryUid = router.query.wbGeometryUid?.toString();
      if (selectedWellbore && wbGeometryUid && !selectedWbGeometryGroup) {
        const wbGeometry = selectedWellbore.wbGeometrys.find((object: WbGeometryObject) => object.uid === wbGeometryUid);
        const action: SelectWbGeometryAction = {
          type: NavigationType.SelectWbGeometry,
          payload: { wbGeometryGroup: calculateWbGeometryGroupId(selectedWellbore), well: selectedWell, wellbore: selectedWellbore, wbGeometry }
        };
        dispatch(wbGeometry, action);
      }
    }
  }, [selectedWellbore]);

  return <></>;
};

const isQueryParamsEqual = (urlQp: QueryParams, stateQp: QueryParams): boolean => {
  if (Object.keys(urlQp).length !== Object.keys(urlQp).length) {
    return false;
  }

  return (Object.keys(urlQp) as (keyof typeof urlQp)[]).every((key) => {
    return Object.prototype.hasOwnProperty.call(stateQp, key) && urlQp[key] === stateQp[key];
  });
};

const getQueryParamsFromState = (state: NavigationState): QueryParams => {
  return {
    ...(state.selectedServer && { serverUrl: state.selectedServer.url }),
    ...(state.selectedWell && { wellUid: state.selectedWell.uid }),
    ...(state.selectedWellbore && { wellboreUid: state.selectedWellbore.uid }),
    ...(state.selectedBhaRunGroup && { bhaRunUid: state.selectedBhaRunGroup }),
    ...(state.selectedLog && { logObjectUid: state.selectedLog.uid }),
    ...(state.selectedMessageGroup && { messageUid: state.selectedMessageGroup }),
    ...(state.selectedRigGroup && { rigUid: state.selectedRigGroup }),
    ...(state.selectedRiskGroup && { riskUid: state.selectedRiskGroup }),
    ...(state.selectedTrajectory && { trajectoryUid: state.selectedTrajectory.uid }),
    ...(state.selectedTubular && { tubularUid: state.selectedTubular.uid }),
    ...(state.selectedWbGeometry && { wbGeometryUid: state.selectedWbGeometry.uid })
  };
};

const getQueryParamsFromUrl = (router: NextRouter): QueryParams => {
  return {
    ...(router.query.serverUrl && { serverUrl: router.query.serverUrl.toString() }),
    ...(router.query.wellUid && { wellUid: router.query.wellUid.toString() }),
    ...(router.query.wellboreUid && { wellboreUid: router.query.wellboreUid.toString() }),
    ...(router.query.bhaRunUid && { bhaRunUid: router.query.bhaRunUid.toString() }),
    ...(router.query.logObjectUid && { logObjectUid: router.query.logObjectUid.toString() }),
    ...(router.query.messageUid && { messageUid: router.query.messageUid.toString() }),
    ...(router.query.rigUid && { rigUid: router.query.rigUid.toString() }),
    ...(router.query.riskUid && { riskUid: router.query.riskUid.toString() }),
    ...(router.query.trajectoryUid && { trajectoryUid: router.query.trajectoryUid.toString() }),
    ...(router.query.tubularUid && { tubularUid: router.query.tubularUid.toString() }),
    ...(router.query.wbGeometryUid && { wbGeometryUid: router.query.wbGeometryUid.toString() })
  };
};

export interface QueryParams {
  serverUrl: string;
  wellUid?: string;
  wellboreUid?: string;
  bhaRunUid?: string;
  logObjectUid?: string;
  messageUid?: string;
  rigUid?: string;
  riskUid?: string;
  trajectoryUid?: string;
  tubularUid?: string;
  wbGeometryUid?: string;
}

export default Routing;
