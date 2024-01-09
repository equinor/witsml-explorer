import { Server } from "models/server";
import Wellbore, { emptyWellbore } from "models/wellbore";
import { ApiClient } from "services/apiClient";

export default class WellboreService {
  public static async getWellbore(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal
  ): Promise<Wellbore> {
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return emptyWellbore();
    }
  }

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
