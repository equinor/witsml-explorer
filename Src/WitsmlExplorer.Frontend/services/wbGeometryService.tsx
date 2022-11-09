import WbGeometryObject from "../models/wbGeometry";
import WbGeometrySection from "../models/wbGeometrySection";
import { ApiClient } from "./apiClient";

export default class WbGeometryObjectService {
  public static async getWbGeometrys(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<WbGeometryObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/wbgeometrys`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getWbGeometry(wellUid: string, wellboreUid: string, wbGeometryId: string, abortSignal?: AbortSignal): Promise<WbGeometryObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/wbgeometrys/${wbGeometryId}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async getWbGeometrySections(wellUid: string, wellboreUid: string, wbGeometryId: string, abortSignal: AbortSignal): Promise<WbGeometrySection[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/wbgeometrys/${wbGeometryId}/wbgeometrysections`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
