import MudlogObject, { emptyMudlogObject } from "../models/mudLog";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";

export default class MudLogObjectService {
  public static async getMudlog(wellUid: string, wellboreUid: string, uid: string, abortSignal?: AbortSignal): Promise<MudlogObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${uid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMudlogObject();
    }
  }

  public static async getMudLogs(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MudlogObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getMudlogFromServer(wellUid: string, wellboreUid: string, uid: string, server: Server, abortSignal?: AbortSignal): Promise<MudlogObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${uid}`, abortSignal, server);
    if (response.ok) {
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
