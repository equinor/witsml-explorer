import { ErrorDetails } from "models/errorDetails";
import ObjectOnWellbore from "models/objectOnWellbore";
import ObjectSearchResult from "models/objectSearchResult";
import {
  ObjectType,
  ObjectTypeToModel,
  pluralizeObjectType
} from "models/objectType";
import { Server } from "models/server";
import Wellbore, {
  ExpandableObjectsCount,
  getObjectsFromWellbore
} from "models/wellbore";
import { ApiClient, throwError } from "services/apiClient";

export default class ObjectService {
  public static async getObjects<Key extends ObjectType>(
    wellUid: string,
    wellboreUid: string,
    objectType: Key,
    abortSignal?: AbortSignal
  ): Promise<ObjectTypeToModel[Key][]> {
    const typeRoute = pluralizeObjectType(objectType).toLowerCase();
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/${typeRoute}`,
      abortSignal
    );
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
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/${typeRoute}/${objectUid}`,
      abortSignal
    );
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
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/${typeRoute}/${objectUid}`,
      abortSignal,
      server
    );
    if (response.ok) {
      // the route returns null if the object was not found so we need to check for it
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      }
    }
    return null;
  }

  public static async getObjectsIdOnly(
    wellUid: string,
    wellboreUid: string,
    objectType: ObjectType,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ObjectOnWellbore[]> {
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/idonly/${objectType}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getObjectIdOnly(
    wellUid: string,
    wellboreUid: string,
    objectType: ObjectType,
    objectUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ObjectOnWellbore> {
    const response = await ApiClient.get(
      `/api/wells/${wellUid}/wellbores/${wellboreUid}/idonly/${objectType}/${objectUid}`,
      abortSignal,
      server
    );
    if (response.ok) {
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      }
    } else {
      return null;
    }
  }

  public static async getObjectsIfMissing<Key extends ObjectType>(
    wellbore: Wellbore,
    objectType: Key,
    abortSignal?: AbortSignal
  ): Promise<ObjectTypeToModel[Key][] | null> {
    const objects = getObjectsFromWellbore(wellbore, objectType);
    if (objects == null || objects.length == 0) {
      return await ObjectService.getObjects(
        wellbore.wellUid,
        wellbore.uid,
        objectType,
        abortSignal
      );
    }
    return null;
  }

  public static async getExpandableObjectsCount(
    wellbore: Wellbore,
    abortSignal?: AbortSignal
  ): Promise<ExpandableObjectsCount> {
    const response = await ApiClient.get(
      `/api/wells/${wellbore.wellUid}/wellbores/${wellbore.uid}/countexpandable`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  }

  public static async getObjectsByType(
    type: ObjectType,
    abortSignal?: AbortSignal
  ): Promise<ObjectSearchResult[]> {
    const response = await ApiClient.get(`/api/objects/${type}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getObjectsWithParamByType(
    type: ObjectType,
    propertyName: string,
    propertyValue: string,
    abortSignal?: AbortSignal
  ): Promise<ObjectSearchResult[]> {
    const response = await ApiClient.get(
      `/api/objects/${type}/${propertyName}/${encodeURIComponent(
        propertyValue
      )}`,
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }
}
