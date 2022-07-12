import ApiClient from "./apiClient";

export default class JobService {
  public static async orderJob(jobType: JobType, payload: Record<string, any>): Promise<any> {
    const response = await ApiClient.post(`/api/jobs/${jobType}`, JSON.stringify(payload));
    if (response.ok) {
      return response.body;
    } else {
      return "";
    }
  }
}

export enum JobType {
  CreateWell = "CreateWell",
  CopyLog = "CopyLog",
  CopyLogData = "CopyLogData",
  CopyTrajectory = "CopyTrajectory",
  CopyTubular = "CopyTubular",
  CopyTubularComponents = "CopyTubularComponents",
  CreateWellbore = "CreateWellbore",
  CreateLogObject = "CreateLogObject",
  DeleteCurveValues = "DeleteCurveValues",
  DeleteLogObjects = "DeleteLogObjects",
  DeleteMessageObjects = "DeleteMessageObjects",
  DeleteMnemonics = "DeleteMnemonics",
  DeleteRisks = "DeleteRisks",
  DeleteWell = "DeleteWell",
  DeleteWellbore = "DeleteWellbore",
  DeleteTrajectory = "DeleteTrajectory",
  DeleteTubular = "DeleteTubular",
  DeleteTubularComponents = "DeleteTubularComponents",
  ModifyLogObject = "ModifyLogObject",
  ModifyMessageObject = "ModifyMessageObject",
  ModifyRisk = "ModifyRisk",
  RenameMnemonic = "RenameMnemonic",
  ModifyTubular = "ModifyTubular",
  ModifyTubularComponent = "ModifyTubularComponent",
  ModifyWell = "ModifyWell",
  ModifyWellbore = "ModifyWellbore",
  TrimLogObject = "TrimLogObject",
  BatchModifyWell = "BatchModifyWell",
  ImportLogData = "ImportLogData"
}
