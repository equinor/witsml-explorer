import { ObjectType } from "../models/objectType";
import { Server } from "../models/server";
import Wellbore, { emptyWellbore, WellboreObjects } from "../models/wellbore";
import { ApiClient } from "./apiClient";
import ObjectService from "./objectService";

// Removes 'optional' attributes from a type's properties
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

export default class WellboreService {
  public static async getWellbore(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<Wellbore> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyWellbore();
    }
  }

  public static async getWellboreFromServer(wellUid: string, wellboreUid: string, server: Server, abortSignal?: AbortSignal): Promise<Wellbore> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}`, abortSignal, server);
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
    const getObjects = WellboreService.getWellboreObjects(wellUid, wellboreUid);
    const [wellbore, wellboreObjects] = await Promise.all([getWellbore, getObjects]);

    return { ...wellbore, ...wellboreObjects };
  }

  public static async getWellboreObjects(wellUid: string, wellboreUid: string): Promise<Concrete<WellboreObjects>> {
    const getBhaRuns = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.BhaRun);
    const getFormationMarkers = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.FormationMarker);
    const getLogs = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Log);
    const getMessages = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Message);
    const getMudLogs = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.MudLog);
    const getRigs = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Rig);
    const getRisks = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Risk);
    const getTrajectories = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Trajectory);
    const getTubulars = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.Tubular);
    const getWbGeometrys = ObjectService.getObjects(wellUid, wellboreUid, ObjectType.WbGeometry);
    const [bhaRuns, formationMarkers, logs, messages, mudLogs, rigs, risks, trajectories, tubulars, wbGeometrys] = await Promise.all([
      getBhaRuns,
      getFormationMarkers,
      getLogs,
      getMessages,
      getMudLogs,
      getRigs,
      getRisks,
      getTrajectories,
      getTubulars,
      getWbGeometrys
    ]);
    return { bhaRuns, formationMarkers, logs, messages, mudLogs, rigs, risks, trajectories, tubulars, wbGeometrys };
  }
}
