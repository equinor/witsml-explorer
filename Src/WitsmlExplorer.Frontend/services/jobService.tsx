import JobInfo from "../models/jobs/jobInfo";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";
import AuthorizationService from "./authorizationService";
import NotificationService from "./notificationService";

export default class JobService {
  public static async orderJob(jobType: JobType, payload: Record<string, any>): Promise<any> {
    const response = await ApiClient.post(`/api/jobs/${jobType}`, JSON.stringify(payload));
    return this.onResponse(jobType, response);
  }

  public static async orderJobAtServer(jobType: JobType, payload: Record<string, any>, targetServer: Server, sourceServer: Server): Promise<any> {
    const response = await ApiClient.post(`/api/jobs/${jobType}`, JSON.stringify(payload), undefined, targetServer, sourceServer);
    return this.onResponse(jobType, response, targetServer);
  }

  private static async onResponse(jobType: JobType, response: Response, server = AuthorizationService.selectedServer): Promise<any> {
    AuthorizationService.resetSourceServer();
    if (response.ok) {
      NotificationService.Instance.snackbarDispatcher.dispatch({
        serverUrl: new URL(server?.url),
        message: `Ordered ${jobType} job`,
        isSuccess: true
      });
      return response.body;
    } else {
      NotificationService.Instance.snackbarDispatcher.dispatch({
        serverUrl: new URL(server?.url),
        message: `Failed ordering ${jobType} job`,
        isSuccess: false
      });
      return "";
    }
  }

  public static async getUserJobInfos(abortSignal?: AbortSignal): Promise<JobInfo[]> {
    const response = await ApiClient.get(`/api/jobs/userjobinfos`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getAllJobInfos(abortSignal?: AbortSignal): Promise<JobInfo[]> {
    const response = await ApiClient.get(`/api/jobs/alljobinfos`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}

export enum JobType {
  CreateWell = "CreateWell",
  CopyLog = "CopyLog",
  CopyLogData = "CopyLogData",
  CopyObjects = "CopyObjects",
  CopyTrajectoryStations = "CopyTrajectoryStations",
  CopyTubularComponents = "CopyTubularComponents",
  CopyWbGeometrySections = "CopyWbGeometrySections",
  CreateWellbore = "CreateWellbore",
  CreateLogObject = "CreateLogObject",
  DeleteCurveValues = "DeleteCurveValues",
  DeleteMnemonics = "DeleteMnemonics",
  DeleteObjects = "DeleteObjects",
  DeleteWell = "DeleteWell",
  DeleteWellbore = "DeleteWellbore",
  DeleteTrajectoryStations = "DeleteTrajectoryStations",
  DeleteTubularComponents = "DeleteTubularComponents",
  DeleteWbGeometrySections = "DeleteWbGeometrySections",
  ModifyBhaRun = "ModifyBhaRun",
  ModifyLogObject = "ModifyLogObject",
  ModifyMessageObject = "ModifyMessageObject",
  ModifyMudLog = "ModifyMudLog",
  ModifyRig = "ModifyRig",
  ModifyRisk = "ModifyRisk",
  RenameMnemonic = "RenameMnemonic",
  ModifyTrajectoryStation = "ModifyTrajectoryStation",
  ModifyTubular = "ModifyTubular",
  ModifyTubularComponent = "ModifyTubularComponent",
  ModifyWbGeometry = "ModifyWbGeometry",
  ModifyWbGeometrySection = "ModifyWbGeometrySection",
  ModifyWell = "ModifyWell",
  ModifyWellbore = "ModifyWellbore",
  TrimLogObject = "TrimLogObject",
  BatchModifyWell = "BatchModifyWell",
  ImportLogData = "ImportLogData",
  ReplaceLogData = "ReplaceLogData",
  ReplaceLogObjects = "ReplaceLogObjects"
}
