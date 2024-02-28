import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import { ServerCapabilities } from "models/serverCapabilities";
import { ApiClient, throwError } from "services/apiClient";

export default class CapService {
  public static async getCap(
    abortSignal: AbortSignal = null,
    server?: Server
  ): Promise<ServerCapabilities> {
    const response = await ApiClient.get(
      "/api/capabilities",
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

  public static async getCapObjects(
    capFunction: CapFunctions = CapFunctions.GetFromStore,
    abortSignal: AbortSignal = null,
    server?: Server
  ): Promise<string[]> {
    const capabilities = await CapService.getCap(abortSignal, server);
    return capabilities.functions
      .find((fn) => fn.name == capFunction)
      ?.dataObjects?.map((o) => o.name);
  }
}

export enum CapFunctions {
  GetCap = "WMLS_GetCap",
  GetFromStore = "WMLS_GetFromStore",
  AddToStore = "WMLS_AddToStore",
  UpdateInStore = "WMLS_UpdateInStore",
  DeleteFromStore = "WMLS_DeleteFromStore",
  GetVersion = "WMLS_GetVersion",
  GetBaseMsg = "WMLS_GetBaseMsg"
}
