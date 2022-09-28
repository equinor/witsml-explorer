import RiskObject from "../models/riskObject";
import { ApiClient } from "./apiClient";

export default class RiskObjectService {
  public static async getRisks(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<RiskObject[]> {
    const response = await ApiClient.get(`/wells/${wellUid}/wellbores/${wellboreUid}/risks`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
