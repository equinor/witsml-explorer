import { ErrorDetails } from "../models/errorDetails";
import { Server } from "../models/server";
import Wellbore, { emptyWellbore } from "../models/wellbore";
import { ApiClient, throwError } from "./apiClient";

export default class WellboreService {
  public static async getWellbores(
    wellUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<Wellbore[]> {
    const response = await ApiClient.get(
      `api/wells/${wellUid}/wellbores`,
      abortSignal,
      server
    );

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
      `/api/wells/${wellUid}/wellbores/${wellboreUid}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return response.json();
    } else {
      return emptyWellbore();
    }
  }

  // TODO: Is this method needed? It treats the response a bit different than the method above.
  public static async getWellboreFromServer(
    wellUid: string,
    wellboreUid: string,
    server: Server,
    abortSignal?: AbortSignal
  ): Promise<Wellbore> {
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}`,
      abortSignal,
      server
    );
    if (response.ok) {
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      } else {
        return emptyWellbore();
      }
    } else {
      return emptyWellbore();
    }
  }
}
