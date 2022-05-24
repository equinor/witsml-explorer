import ApiClient from "./apiClient";
import Tubular from "../models/tubular";

export default class TubularService {
  public static async getTubulars(wellId: string, wellboreId: string, abortSignal?: AbortSignal): Promise<Tubular[]> {
    const response = await ApiClient.get(`/api/wells/${wellId}/wellbores/${wellboreId}/tubulars`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
