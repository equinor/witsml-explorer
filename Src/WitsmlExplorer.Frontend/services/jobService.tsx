import { Server } from "../models/server";
import ApiClient from "./apiClient";
import CredentialsService from "./credentialsService";

export default class JobService {
  private static jobIds: Map<string, string[]> = new Map<string, string[]>();

  public static async orderJob(jobType: JobType, payload: Record<string, any>): Promise<any> {
    const response = await ApiClient.post(`/api/jobs/${jobType}`, JSON.stringify(payload));
    if (response.ok) {
      this.storeJobId(await response.json());
      return response.body;
    } else {
      return "";
    }
  }

  private static storeJobId(id: string) {
    const server = CredentialsService.getSelectedServer();
    if (this.jobIds.has(server.id)) {
      this.jobIds.get(server.id).push(id);
    } else {
      const ids = this.getStoredJobIds(server);
      ids.push(id);
      this.jobIds.set(server.id, ids);
    }
    localStorage.setItem(server.id, JSON.stringify(this.jobIds.get(server.id)));
  }

  public static getStoredJobIds(server: Server): string[] {
    if (this.jobIds.has(server.id)) {
      return this.jobIds.get(server.id);
    }
    const storedIds = localStorage.getItem(server.id);
    if (storedIds) {
      const ids = JSON.parse(storedIds);
      this.jobIds.set(server.id, ids);
      return ids;
    }
    this.jobIds.set(server.id, []);
    return [];
  }
}

export enum JobType {
  CreateWell = "CreateWell",
  CopyBhaRun = "CopyBhaRun",
  CopyLog = "CopyLog",
  CopyLogData = "CopyLogData",
  CopyTrajectory = "CopyTrajectory",
  CopyTubular = "CopyTubular",
  CopyTubularComponents = "CopyTubularComponents",
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
  DeleteTrajectory = "DeleteTrajectory",
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
  ModifyWell = "ModifyWell",
  ModifyWellbore = "ModifyWellbore",
  TrimLogObject = "TrimLogObject",
  BatchModifyWell = "BatchModifyWell",
  ImportLogData = "ImportLogData"
}
