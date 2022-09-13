import Wellbore, { emptyWellbore } from "../models/wellbore";
import { ApiClient } from "./apiClient";
import BhaRunService from "./bhaRunService";
import { BasicServerCredentials } from "./credentialsService";
import LogObjectService from "./logObjectService";
import RigService from "./rigService";
import RiskObjectService from "./riskObjectService";
import TrajectoryService from "./trajectoryService";
import TubularService from "./tubularService";
import WbGeometryObjectService from "./wbGeometryService";

export default class WellboreService {
  public static async getWellbore(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<Wellbore> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyWellbore();
    }
  }

  public static async getWellboreFromServer(wellUid: string, wellboreUid: string, credentials: BasicServerCredentials, abortSignal?: AbortSignal): Promise<Wellbore> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}`, abortSignal, [credentials]);
    if (response.ok) {
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      } else {
        return emptyWellbore();
      }
    } else {
      return emptyWellbore();
    }
  }

  public static async getCompleteWellbore(wellUid: string, wellboreUid: string): Promise<Wellbore> {
    const getWellbore = WellboreService.getWellbore(wellUid, wellboreUid);
    const getBhaRuns = BhaRunService.getBhaRuns(wellUid, wellboreUid);
    const getLogs = LogObjectService.getLogs(wellUid, wellboreUid);
    const getRigs = RigService.getRigs(wellUid, wellboreUid);
    const getRisks = RiskObjectService.getRisks(wellUid, wellboreUid);
    const getTrajectories = TrajectoryService.getTrajectories(wellUid, wellboreUid);
    const getTubulars = TubularService.getTubulars(wellUid, wellboreUid);
    const getWbGeometrys = WbGeometryObjectService.getWbGeometrys(wellUid, wellboreUid);
    const [wellbore, bhaRuns, logs, rigs, risks, trajectories, tubulars, wbGeometrys] = await Promise.all([
      getWellbore,
      getBhaRuns,
      getLogs,
      getRigs,
      getRisks,
      getTrajectories,
      getTubulars,
      getWbGeometrys
    ]);

    return { ...wellbore, bhaRuns, logs, rigs, risks, trajectories, tubulars, wbGeometrys };
  }
}
