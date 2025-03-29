import JobInfo from "models/jobs/jobInfo";
import BaseReport from "models/reports/BaseReport";
import { Server } from "models/server";
import { ApiClient, throwError } from "services/apiClient";
import AuthorizationService from "services/authorizationService";
import NotificationService from "services/notificationService";

export default class JobService {
  public static async orderJob(
    jobType: JobType,
    payload: Record<string, any>
  ): Promise<any> {
    const response = await ApiClient.post(
      `/api/jobs/${jobType}`,
      JSON.stringify(payload)
    );
    return this.onResponse(jobType, response);
  }

  public static async orderJobAtServer(
    jobType: JobType,
    payload: Record<string, any>,
    targetServer: Server,
    sourceServer: Server
  ): Promise<any> {
    const response = await ApiClient.post(
      `/api/jobs/${jobType}`,
      JSON.stringify(payload),
      undefined,
      targetServer,
      sourceServer
    );
    return this.onResponse(jobType, response, targetServer, sourceServer);
  }

  private static async onResponse(
    jobType: JobType,
    response: Response,
    server = AuthorizationService.selectedServer,
    sourceServer: Server = null
  ): Promise<any> {
    AuthorizationService.resetSourceServer();
    if (response.ok) {
      NotificationService.Instance.snackbarDispatcher.dispatch({
        serverUrl: new URL(server?.url),
        sourceServerUrl: sourceServer ? new URL(sourceServer?.url) : null,
        message: `Ordered ${jobType} job`,
        isSuccess: true
      });
      return response.json();
    } else {
      NotificationService.Instance.snackbarDispatcher.dispatch({
        serverUrl: new URL(server?.url),
        sourceServerUrl: sourceServer ? new URL(sourceServer?.url) : null,
        message: `Failed ordering ${jobType} job`,
        isSuccess: false
      });
      return "";
    }
  }

  public static async getUserJobInfo(
    jobId: string,
    abortSignal?: AbortSignal
  ): Promise<JobInfo> {
    const response = await ApiClient.get(
      `/api/jobs/userjobinfo/${jobId}`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async getUserJobInfos(
    abortSignal?: AbortSignal
  ): Promise<JobInfo[]> {
    const response = await ApiClient.get(`/api/jobs/userjobinfos`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getAllJobInfos(
    abortSignal?: AbortSignal
  ): Promise<JobInfo[]> {
    const response = await ApiClient.get(`/api/jobs/alljobinfos`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async cancelJob(
    jobId: string,
    abortSignal?: AbortSignal
  ): Promise<string> {
    const response = await ApiClient.post(
      `/api/jobs/cancel/${jobId}`,
      null,
      abortSignal
    );
    if (response.ok) {
      return jobId;
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async getReport(
    jobId: string,
    abortSignal?: AbortSignal
  ): Promise<BaseReport> {
    const response = await ApiClient.get(
      `/api/jobs/report/${jobId}`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async downloadFile(jobId: string): Promise<void> {
    const response = await ApiClient.get(`/api/jobs/download/${jobId}`);

    if (response.ok) {
      const blob = await response.blob();

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.match(/filename="?([^";]+)"?/)?.[1] || "report";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      throwError(response.status, response.statusText);
    }
  }
}

export enum JobType {
  CheckLogHeader = "CheckLogHeader",
  CreateWell = "CreateWell",
  CopyComponents = "CopyComponents",
  CopyLogData = "CopyLogData",
  CopyObjects = "CopyObjects",
  CopyWell = "CopyWell",
  CopyWellbore = "CopyWellbore",
  CopyWellboreWithObjects = "CopyWellboreWithObjects",
  CopyWithParent = "CopyWithParent",
  CopyObjectsWithParent = "CopyObjectsWithParent",
  CreateWellbore = "CreateWellbore",
  CreateObjectOnWellbore = "CreateObjectOnWellbore",
  DeleteComponents = "DeleteComponents",
  DeleteCurveValues = "DeleteCurveValues",
  DeleteObjects = "DeleteObjects",
  DeleteWell = "DeleteWell",
  DeleteWellbore = "DeleteWellbore",
  MissingData = "MissingData",
  ModifyGeologyInterval = "ModifyGeologyInterval",
  ModifyLogCurveInfo = "ModifyLogCurveInfo",
  BatchModifyLogCurveInfo = "BatchModifyLogCurveInfo",
  DeleteEmptyMnemonics = "DeleteEmptyMnemonics",
  ModifyTrajectoryStation = "ModifyTrajectoryStation",
  ModifyTubularComponent = "ModifyTubularComponent",
  ModifyWbGeometrySection = "ModifyWbGeometrySection",
  ModifyWell = "ModifyWell",
  ModifyWellbore = "ModifyWellbore",
  ModifyObjectOnWellbore = "ModifyObjectOnWellbore",
  BatchModifyObjectsOnWellbore = "BatchModifyObjectsOnWellbore",
  TrimLogObject = "TrimLogObject",
  BatchModifyWell = "BatchModifyWell",
  ImportLogData = "ImportLogData",
  ReplaceComponents = "ReplaceComponents",
  ReplaceObjects = "ReplaceObjects",
  AnalyzeGaps = "AnalyzeGaps",
  SpliceLogs = "SpliceLogs",
  CompareLogData = "CompareLogData",
  CountLogDataRows = "CountLogDataRows",
  DownloadLogData = "DownloadLogData",
  OffsetLogCurves = "OffsetLogCurves",
  MinimumDataQc = "MinimumDataQc"
}
