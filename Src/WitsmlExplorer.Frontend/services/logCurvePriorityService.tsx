import { ApiClient } from "./apiClient";

export default class LogCurvePriorityService {
  public static async getPrioritizedCurves(
    isUniversal: boolean,
    wellUid?: string,
    wellboreUid?: string,
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const path = isUniversal
      ? `/api/universal/logCurvePriority`
      : `/api/wells/${encodeURIComponent(
          wellUid
        )}/wellbores/${encodeURIComponent(wellboreUid)}/logCurvePriority`;
    const response = await ApiClient.get(path, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async setPrioritizedCurves(
    prioritizedCurves: string[],
    isUniversal: boolean,
    wellUid?: string,
    wellboreUid?: string,
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const path = isUniversal
      ? `/api/universal/logCurvePriority`
      : `/api/wells/${encodeURIComponent(
          wellUid
        )}/wellbores/${encodeURIComponent(wellboreUid)}/logCurvePriority`;
    const response = await ApiClient.post(
      path,
      JSON.stringify(prioritizedCurves),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }
}
