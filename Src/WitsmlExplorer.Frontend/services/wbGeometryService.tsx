import ApiClient from "./apiClient";
import WbGeometryObject from "../models/wbGeometry";

export default class WbGeometryObjectService {
  public static async getWbGeometrys(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<WbGeometryObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/wbGeometrys`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getWbGeometry(wellUid: string, wellboreUid: string, wbGeometryId: string, abortSignal?: AbortSignal): Promise<WbGeometryObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/wbGeometrys/${wbGeometryId}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }
}
