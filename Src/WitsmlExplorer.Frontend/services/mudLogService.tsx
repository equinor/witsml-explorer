import mudLog, { emptymudLog } from "../models/mudLog";
import { ApiClient } from "./apiClient";

export default class mudLogService {
  public static async getMudLog(wellUid: string, wellboreUid: string, uid: string, abortSignal?: AbortSignal): Promise<mudLog> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${uid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptymudLog();
    }
  }

  public static async getMudLogs(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<mudLog[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
