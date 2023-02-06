import MessageObject, { emptyMessageObject } from "../models/messageObject";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";

export default class MessageObjectService {
  public static async getMessage(wellUid: string, wellboreUid: string, uid: string, abortSignal?: AbortSignal): Promise<MessageObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/messages/${uid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMessageObject();
    }
  }

  public static async getMessages(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MessageObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/messages`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getMessageFromServer(wellUid: string, wellboreUid: string, uid: string, server: Server, abortSignal?: AbortSignal): Promise<MessageObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/messages/${uid}`, abortSignal, server);
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
