import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import { ApiClient, throwError } from "services/apiClient";

export default class WellboreService {
  public static async getWellbores(
    wellUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<Wellbore[]> {
    const endpoint = wellUid
      ? `api/wells/${encodeURIComponent(wellUid)}/wellbores`
      : "api/wellbores";
    const response = await ApiClient.get(endpoint, abortSignal, server);

    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getWellbore(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<Wellbore> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return response.json().catch(() => null);
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }
}
