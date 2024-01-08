import { ApiClient } from "./apiClient";

export default class LogCurvePriorityService {
  public static async getPrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/logCurvePriority`,
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
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const response = await ApiClient.post(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/logCurvePriority`,
      JSON.stringify(prioritizedCurves),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async updatePrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    prioritizedCurves: string[],
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const response = await ApiClient.patch(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/logCurvePriority`,
      JSON.stringify(prioritizedCurves),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async deletePrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal
  ): Promise<Response> {
    const response = await ApiClient.delete(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/logCurvePriority`,
      abortSignal
    );
    return response;
  }
}
