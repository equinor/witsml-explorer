import ApiClient from "./apiClient";
import MessageObject, { emptyMessageObject } from "../models/messageObject";

export default class MessageObjectService {
  public static async getMessageObject(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<MessageObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyMessageObject();
    }
  }
}
