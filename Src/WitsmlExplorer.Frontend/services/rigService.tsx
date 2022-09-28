import Rig, { emptyRig } from "../models/rig";
import { ApiClient } from "./apiClient";

export default class RigService {
  public static async getRigs(wellId: string, wellboreId: string, abortSignal?: AbortSignal): Promise<Rig[]> {
    const response = await ApiClient.get(`/wells/${wellId}/wellbores/${wellboreId}/rigs`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getRig(wellUid: string, wellboreUid: string, rigUid: string, abortSignal?: AbortSignal): Promise<Rig> {
    const response = await ApiClient.get(`/wells/${wellUid}/wellbores/${wellboreUid}/rigs/${rigUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyRig();
    }
  }
}
