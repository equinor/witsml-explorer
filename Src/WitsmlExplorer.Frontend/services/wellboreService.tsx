import ApiClient from "./apiClient";
import Wellbore, { emptyWellbore } from "../models/wellbore";
import LogObjectService from "./logObjectService";
import TrajectoryService from "./trajectoryService";
import RigService from "./rigService";
import TubularService from "./tubularService";

export default class WellboreService {
  public static async getWellbore(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<Wellbore> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyWellbore();
    }
  }

  public static async getCompleteWellbore(wellUid: string, wellboreUid: string): Promise<Wellbore> {
    const getWellbore = WellboreService.getWellbore(wellUid, wellboreUid);
    const getLogs = LogObjectService.getLogs(wellUid, wellboreUid);
    const getRigs = RigService.getRigs(wellUid, wellboreUid);
    //TODO find out whether "getMessages" should be called here
    const getTrajectories = TrajectoryService.getTrajectories(wellUid, wellboreUid);
    const getTubulars = TubularService.getTubulars(wellUid, wellboreUid);
    const [wellbore, logs, rigs, trajectories, tubulars] = await Promise.all([getWellbore, getLogs, getRigs, getTrajectories, getTubulars]);

    return { ...wellbore, logs, rigs, trajectories, tubulars };
  }
}
