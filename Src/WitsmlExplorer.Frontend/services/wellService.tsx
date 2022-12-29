import { ErrorDetails } from "../models/errorDetails";
import Well, { emptyWell } from "../models/well";
import { ApiClient } from "./apiClient";

export default class WellService {
  public static async getWells(abortSignal: AbortSignal = null): Promise<Well[]> {
    const response = await ApiClient.get(`api/wells`, abortSignal, undefined, undefined, false);

    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      switch (response.status) {
        case 401:
        case 404:
        case 500:
          throw new Error(message);
        default:
          throw new Error(`Something unexpected has happened.`);
      }
    }
  }

  public static async getWell(wellUid: string, abortSignal: AbortSignal = null): Promise<Well> {
    const response = await ApiClient.get(`/api/wells/${wellUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyWell();
    }
  }
}
