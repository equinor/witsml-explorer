import BhaRun from "../models/bhaRun";
import { ApiClient } from "./apiClient";

export default class BhaRunService {
  public static async getBhaRuns(wellId: string, wellboreId: string, abortSignal?: AbortSignal): Promise<BhaRun[]> {
    const response = await ApiClient.get(`/wells/${wellId}/wellbores/${wellboreId}/bhaRuns`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getBhaRun(wellUid: string, wellboreUid: string, bhaRunId: string, abortSignal?: AbortSignal): Promise<BhaRun> {
    const response = await ApiClient.get(`/wells/${wellUid}/wellbores/${wellboreUid}/bhaRuns/${bhaRunId}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }
}
