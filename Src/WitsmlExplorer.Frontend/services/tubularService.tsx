import Tubular from "../models/tubular";
import TubularComponent from "../models/tubularComponent";
import { ApiClient } from "./apiClient";

export default class TubularService {
  public static async getTubulars(wellId: string, wellboreId: string, abortSignal?: AbortSignal): Promise<Tubular[]> {
    const response = await ApiClient.get(`/api/wells/${wellId}/wellbores/${wellboreId}/tubulars`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getTubular(wellUid: string, wellboreUid: string, tubularId: string, abortSignal?: AbortSignal): Promise<Tubular> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/tubulars/${tubularId}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async getTubularComponents(wellUid: string, wellboreUid: string, tubularId: string, abortSignal: AbortSignal): Promise<TubularComponent[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/tubulars/${tubularId}/tubularcomponents`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
