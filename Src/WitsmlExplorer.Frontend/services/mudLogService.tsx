import GeologyInterval from "../models/geologyInterval";
import MudLog, { emptyMudLog } from "../models/mudLog";
import { ApiClient } from "./apiClient";

export default class MudLogService {
  public static async getMudLog(wellUid: string, wellboreUid: string, uid: string, abortSignal?: AbortSignal): Promise<MudLog> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${uid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMudLog();
    }
  }

  public static async getMudLogs(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MudLog[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getGeologyIntervals(wellUid: string, wellboreUid: string, mudLogId: string, abortSignal: AbortSignal): Promise<GeologyInterval[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${mudLogId}/geologyintervals`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
