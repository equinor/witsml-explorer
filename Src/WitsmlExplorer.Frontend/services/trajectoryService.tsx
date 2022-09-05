import Trajectory from "../models/trajectory";
import TrajectoryStation from "../models/trajectoryStation";
import { ApiClient } from "./apiClient";

export default class TrajectoryService {
  public static async getTrajectories(wellId: string, wellboreId: string, abortSignal?: AbortSignal): Promise<Trajectory[]> {
    const response = await ApiClient.get(`/api/wells/${wellId}/wellbores/${wellboreId}/trajectories`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getTrajectory(wellUid: string, wellboreUid: string, trajectoryId: string, abortSignal?: AbortSignal): Promise<Trajectory> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/trajectories/${trajectoryId}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async getTrajectoryStations(wellUid: string, wellboreUid: string, trajectoryId: string, abortSignal: AbortSignal): Promise<TrajectoryStation[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/trajectories/${trajectoryId}/trajectoryStations`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
