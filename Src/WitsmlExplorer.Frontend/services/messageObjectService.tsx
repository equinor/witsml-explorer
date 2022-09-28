import MessageObject, { emptyMessageObject } from "../models/messageObject";
import { ApiClient } from "./apiClient";

export default class MessageObjectService {
  public static async getMessage(wellUid: string, wellboreUid: string, uid: string, abortSignal?: AbortSignal): Promise<MessageObject> {
    const response = await ApiClient.get(`/wells/${wellUid}/wellbores/${wellboreUid}/messages/${uid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMessageObject();
    }
  }
  public static async getMessages(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MessageObject[]> {
    const response = await ApiClient.get(`/wells/${wellUid}/wellbores/${wellboreUid}/messages`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
