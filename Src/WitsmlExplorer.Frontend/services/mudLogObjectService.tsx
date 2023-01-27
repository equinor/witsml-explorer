import MudLogObject, { emptyMudLogObject } from "../models/mudLog";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";

export default class MudLogObjectService {
  public static async getMudLog(wellUid: string, wellboreUid: string, uid: string, abortSignal?: AbortSignal): Promise<MudLogObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs/${uid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMudLogObject();
    }
  }

  public static async getMudLogs(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MudLogObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/mudlogs`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getMudLogFromServer(wellUid: string, wellboreUid: string, uid: string, server: Server, abortSignal?: AbortSignal): Promise<MudLogObject> {
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
