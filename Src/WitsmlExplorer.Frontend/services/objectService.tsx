import { ObjectType, ObjectTypeToModel, pluralizeObjectType } from "../models/objectType";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";

export default class ObjectService {
  public static async getObjects<Key extends ObjectType>(wellUid: string, wellboreUid: string, objectType: Key, abortSignal?: AbortSignal): Promise<ObjectTypeToModel[Key][]> {
    const typeRoute = pluralizeObjectType(objectType).toLowerCase();
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/${typeRoute}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getObject<Key extends ObjectType>(
    wellUid: string,
    wellboreUid: string,
    objectUid: string,
    objectType: Key,
    abortSignal?: AbortSignal
  ): Promise<ObjectTypeToModel[Key]> {
    const typeRoute = pluralizeObjectType(objectType).toLowerCase();
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/${typeRoute}/${objectUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async getObjectFromServer<Key extends ObjectType>(
    wellUid: string,
    wellboreUid: string,
    objectUid: string,
    objectType: Key,
    server: Server,
    abortSignal?: AbortSignal
  ): Promise<ObjectTypeToModel[Key]> {
    const typeRoute = pluralizeObjectType(objectType).toLowerCase();
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/${typeRoute}/${objectUid}`, abortSignal, server);
    if (response.ok) {
      // the route returns null if the object was not found so we need to check for it
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      }
    }
    return null;
  }
}
