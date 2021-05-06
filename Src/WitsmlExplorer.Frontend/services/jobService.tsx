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
  CreateWellbore = "CreateWellbore",
  CreateLogObject = "CreateLogObject",
  DeleteCurveValues = "DeleteCurveValues",
  DeleteLogObjects = "DeleteLogObjects",
  DeleteMnemonics = "DeleteMnemonics",
  DeleteWell = "DeleteWell",
  DeleteWellbore = "DeleteWellbore",
  DeleteTrajectory = "DeleteTrajectory",
  ModifyLogObject = "ModifyLogObject",
  RenameMnemonic = "RenameMnemonic",
  ModifyWell = "ModifyWell",
  ModifyWellbore = "ModifyWellbore",
  TrimLogObject = "TrimLogObject",
  BatchModifyWell = "BatchModifyWell"
}
