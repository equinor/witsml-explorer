import { ApiClient, throwError } from "./apiClient.tsx";
import { ErrorDetails } from "../models/errorDetails.ts";
import {
  UidMapping,
  UidMappingBasicInfo,
  UidMappingDbQuery
} from "../models/uidMapping.tsx";

export default class UidMappingService {
  public static async addUidMapping(
    uidMapping: UidMapping,
    abortSignal?: AbortSignal
  ): Promise<UidMapping> {
    const response = await ApiClient.post(
      `/api/uidmapping`,
      JSON.stringify(uidMapping),
      abortSignal,
      undefined
    );
    if (response.ok) {
      return await response.json();
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async updateUidMapping(
    uidMapping: UidMapping,
    abortSignal?: AbortSignal
  ): Promise<UidMapping> {
    const response = await ApiClient.patch(
      `/api/uidmapping`,
      JSON.stringify(uidMapping),
      abortSignal
    );
    if (response.ok) {
      return await response.json();
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async getUidMappingBasicInfos(
    abortSignal?: AbortSignal
  ): Promise<UidMappingBasicInfo[]> {
    const response = await ApiClient.get(
      `/api/uidmapping/basicinfos`,
      abortSignal,
      undefined
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async queryUidMapping(
    query: UidMappingDbQuery,
    abortSignal?: AbortSignal
  ): Promise<UidMapping[]> {
    const response = await ApiClient.post(
      `/api/uidmapping/query`,
      JSON.stringify(query),
      abortSignal,
      undefined
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async removeUidMapping(
    query: UidMappingDbQuery,
    abortSignal?: AbortSignal
  ): Promise<boolean> {
    const response = await ApiClient.post(
      `/api/uidmapping/deletemapping`,
      JSON.stringify(query),
      abortSignal,
      undefined
    );
    if (response.ok) {
      return true;
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async removeUidMappings(
    { wellUid, wellboreUid }: { wellUid: string; wellboreUid?: string },
    abortSignal?: AbortSignal
  ): Promise<boolean> {
    const path =
      `/api/uidmapping/deletemappings/well/${wellUid}` + !!wellboreUid
        ? `/wellbore/${wellboreUid}`
        : ``;

    const response = await ApiClient.delete(path, abortSignal);
    if (response.ok) {
      return true;
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }
}
