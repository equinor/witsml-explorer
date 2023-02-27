import TrajectoryStation from "../models/trajectoryStation";
import { ApiClient } from "./apiClient";

export default class TrajectoryService {
  public static async getTrajectoryStations(wellUid: string, wellboreUid: string, trajectoryId: string, abortSignal: AbortSignal): Promise<TrajectoryStation[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/trajectories/${trajectoryId}/trajectoryStations`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
