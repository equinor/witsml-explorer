import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import { ApiClient, throwError } from "services/apiClient";
import {
  getUsedProtocol,
  ProtocolAwareResponse
} from "services/protocolAwareResponse";

export default class WellboreService {
  public static async getWellbores(
    wellUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ProtocolAwareResponse<Wellbore[]>> {
    const endpoint = wellUid
      ? `api/wells/${encodeURIComponent(wellUid)}/wellbores`
      : "api/wellbores";
    const response = await ApiClient.get(endpoint, abortSignal, server);

    if (response.ok) {
      return {
        data: await response.json(),
        usedProtocol: getUsedProtocol(response)
      };
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getWellbore(
    wellUid: string,
    wellboreUid: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ProtocolAwareResponse<Wellbore>> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return {
        data: await response.json().catch((): null => null),
        usedProtocol: getUsedProtocol(response)
      };
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getWellboreByName(
    wellboreName: string,
    abortSignal?: AbortSignal,
    server?: Server
  ): Promise<ProtocolAwareResponse<Wellbore>> {
    const response = await ApiClient.get(
      `/api/wellbores/name/${encodeURIComponent(wellboreName)}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return {
        data: await response.json().catch((): null => null),
        usedProtocol: getUsedProtocol(response)
      };
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }
}
