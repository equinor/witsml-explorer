import { ErrorDetails } from "models/errorDetails";
import ObjectOnWellbore from "models/objectOnWellbore";
import ObjectSearchResult from "models/objectSearchResult";
import {
  ObjectType,
  ObjectTypeToModel,
  pluralizeObjectType
} from "models/objectType";
import { Server } from "models/server";
import { ExpandableObjectsCount } from "models/wellbore";
import { ApiClient, throwError } from "services/apiClient";

export default class ObjectService {
  public static async getObjects<Key extends ObjectType>(
    wellUid: string,
    wellboreUid: string,
    objectType: Key,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ObjectTypeToModel[Key][]> {
    const typeRoute = pluralizeObjectType(objectType).toLowerCase();
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/${typeRoute}`,
      abortSignal,
      server
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
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ObjectTypeToModel[Key]> {
    const typeRoute = pluralizeObjectType(objectType).toLowerCase();
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/${typeRoute}/${encodeURIComponent(objectUid)}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return response.json().catch(() => null);
    } else {
      return null;
    }
  }

  public static async getObjectsIdOnly(
    wellUid: string,
    wellboreUid: string,
    objectType: ObjectType,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ObjectOnWellbore[]> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/idonly/${objectType}`,
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
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/idonly/${objectType}/${encodeURIComponent(objectUid)}`,
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

  public static async getExpandableObjectsCount(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ExpandableObjectsCount> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/countexpandable`,
      abortSignal,
      server
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
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ObjectSearchResult[]> {
    const response = await ApiClient.get(
      `/api/objects/${type}/${propertyName}/${encodeURIComponent(
        propertyValue
      )}`,
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
}
