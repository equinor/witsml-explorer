import LogCurvePriorites from "models/logCurvePriorities";
import { ApiClient } from "./apiClient";

export default class LogCurvePriorityService {
  public static async getPrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal
  ): Promise<LogCurvePriorites> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/logCurvePriority`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async setPrioritizedCurves(
    wellUid: string,
    wellboreUid: string,
    prioritizedCurves: string[],
    isGlobal: boolean,
    abortSignal?: AbortSignal
  ): Promise<LogCurvePriorites> {
    const path = isGlobal
      ? `/api/global/logCurvePriority`
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
