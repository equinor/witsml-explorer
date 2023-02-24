import GeologyInterval from "../models/geologyInterval";
import { ApiClient } from "./apiClient";

export default class MudLogService {
  public static async getGeologyIntervals(wellUid: string, wellboreUid: string, mudLogId: string, abortSignal: AbortSignal): Promise<GeologyInterval[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${mudLogId}/geologyintervals`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
