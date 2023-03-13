import WbGeometrySection from "../models/wbGeometrySection";
import { ApiClient } from "./apiClient";

export default class WbGeometryObjectService {
  public static async getWbGeometrySections(wellUid: string, wellboreUid: string, wbGeometryId: string, abortSignal: AbortSignal): Promise<WbGeometrySection[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/wbgeometries/${wbGeometryId}/wbgeometrysections`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
