import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import Well, { emptyWell } from "models/well";
import { ApiClient, throwError } from "services/apiClient";

export default class WellService {
  public static async getWells(
    abortSignal: AbortSignal = null,
    server: Server = undefined
  ): Promise<Well[]> {
    const response = await ApiClient.get(`api/wells`, abortSignal, server);

    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getWell(
    wellUid: string,
    abortSignal: AbortSignal = null,
    server: Server = undefined
  ): Promise<Well> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return response.json();
    } else {
      return emptyWell();
    }
  }
}
