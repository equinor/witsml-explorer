import TubularComponent from "../models/tubularComponent";
import { ApiClient } from "./apiClient";

export default class TubularService {
  public static async getTubularComponents(wellUid: string, wellboreUid: string, tubularId: string, abortSignal: AbortSignal): Promise<TubularComponent[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/tubulars/${tubularId}/tubularcomponents`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
