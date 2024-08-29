import { ApiClient } from "./apiClient";

export default class LogCurvePriorityService {
  public static async getPrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/logCurvePriority`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async setPrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    prioritizedCurves: string[],
    prioritizedGlogalCurves: string[],
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const payload = {
      prioritizedCurves: prioritizedCurves,
      prioritizedGlobalCurves: prioritizedGlogalCurves,
    };
    console.log(payload)
    const response = await ApiClient.post(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/logCurvePriority`,
      JSON.stringify(payload),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
