import ApiClient from "./apiClient";
import MessageObject, { emptyMessageObject } from "../models/messageObject";

export default class MessageObjectService {
  public static async getMessageObject(wellUid: string, wellboreUid: string, messageUid: string, abortSignal?: AbortSignal): Promise<MessageObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/messages/${messageUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMessageObject();
    }
  }
  public static async getMessageObjects(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MessageObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/messages`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }
}
