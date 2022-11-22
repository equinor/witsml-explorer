import JobInfo from "../models/jobs/jobInfo";
import { ApiClient } from "./apiClient";
import CredentialsService, { BasicServerCredentials } from "./credentialsService";
import NotificationService from "./notificationService";

export default class JobService {
  public static async orderJob(jobType: JobType, payload: Record<string, any>): Promise<any> {
    const response = await ApiClient.post(`/api/jobs/${jobType}`, JSON.stringify(payload));
    return this.onResponse(jobType, response);
  }

  public static async orderJobAtServer(jobType: JobType, payload: Record<string, any>, credentials: BasicServerCredentials[]): Promise<any> {
    const response = await ApiClient.post(`/api/jobs/${jobType}`, JSON.stringify(payload), undefined, credentials);
    return this.onResponse(jobType, response, credentials);
  }

  private static async onResponse(jobType: JobType, response: Response, credentials = CredentialsService.getCredentials()): Promise<any> {
    if (CredentialsService.getSourceServerCredentials()) {
      CredentialsService.resetSourceServer();
    }
    if (response.ok) {
      NotificationService.Instance.snackbarDispatcher.dispatch({
        serverUrl: new URL(credentials[0]?.server.url),
        message: `Ordered ${jobType} job`,
        isSuccess: true
      });
      return response.body;
    } else {
      NotificationService.Instance.snackbarDispatcher.dispatch({
        serverUrl: new URL(credentials[0]?.server.url),
        message: `Failed ordering ${jobType} job`,
        isSuccess: false
      });
      return "";
    }
  }

  public static async getJobInfos(abortSignal?: AbortSignal): Promise<JobInfo[]> {
    const response = await ApiClient.get(`/api/jobs/jobinfos`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}

export enum JobType {
  CreateWell = "CreateWell",
  CopyBhaRun = "CopyBhaRun",
  CopyLog = "CopyLog",
  CopyLogData = "CopyLogData",
  CopyRig = "CopyRig",
  CopyRisk = "CopyRisk",
  CopyTrajectory = "CopyTrajectory",
  CopyTrajectoryStations = "CopyTrajectoryStations",
  CopyTubular = "CopyTubular",
  CopyTubularComponents = "CopyTubularComponents",
  CopyWbGeometrySections = "CopyWbGeometrySections",
  CreateWellbore = "CreateWellbore",
  CreateLogObject = "CreateLogObject",
  DeleteBhaRuns = "DeleteBhaRuns",
  DeleteCurveValues = "DeleteCurveValues",
  DeleteLogObjects = "DeleteLogObjects",
  DeleteMessageObjects = "DeleteMessageObjects",
  DeleteMnemonics = "DeleteMnemonics",
  DeleteRigs = "DeleteRigs",
  DeleteRisks = "DeleteRisks",
  DeleteWbGeometrys = "DeleteWbGeometrys",
  DeleteWell = "DeleteWell",
  DeleteWellbore = "DeleteWellbore",
  DeleteTrajectories = "DeleteTrajectories",
  DeleteTrajectoryStations = "DeleteTrajectoryStations",
  DeleteTubulars = "DeleteTubular",
  DeleteTubularComponents = "DeleteTubularComponents",
  ModifyBhaRun = "ModifyBhaRun",
  ModifyLogObject = "ModifyLogObject",
  ModifyMessageObject = "ModifyMessageObject",
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
