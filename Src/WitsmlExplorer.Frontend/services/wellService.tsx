import { ErrorDetails } from "models/errorDetails";
import Well, { emptyWell } from "models/well";
import { ApiClient, throwError } from "services/apiClient";

export default class WellService {
  public static async getWells(
    abortSignal: AbortSignal = null
  ): Promise<Well[]> {
    const response = await ApiClient.get(`api/wells`, abortSignal);

    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getWell(
    wellUid: string,
    abortSignal: AbortSignal = null
  ): Promise<Well> {
    const response = await ApiClient.get(`/api/wells/${wellUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyWell();
    }
  }
}
