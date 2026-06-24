import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import Well, { emptyWell } from "models/well";
import { ApiClient, throwError } from "services/apiClient";
import {
  getUsedProtocol,
  ProtocolAwareResponse
} from "services/protocolAwareResponse";

export default class WellService {
  public static async getWells(
    abortSignal: AbortSignal = null,
    server: Server = undefined
  ): Promise<ProtocolAwareResponse<Well[]>> {
    const response = await ApiClient.get(`api/wells`, abortSignal, server);

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

  public static async getWell(
    wellUid: string,
    abortSignal: AbortSignal = null,
    server: Server = undefined
  ): Promise<ProtocolAwareResponse<Well>> {
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}`,
      abortSignal,
      server
    );
    if (response.ok) {
      return {
        data: await response.json(),
        usedProtocol: getUsedProtocol(response)
      };
    } else {
      return {
        data: emptyWell(),
        usedProtocol: getUsedProtocol(response)
      };
    }
  }
}
