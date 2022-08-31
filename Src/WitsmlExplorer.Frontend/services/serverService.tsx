import { ErrorDetails } from "../models/errorDetails";
import { emptyServer, Server } from "../models/server";
import ApiClient, { AuthConfig } from "./apiClient";
import MsalApiClient, { MsalAuthConfig } from "./msalApiClient";

export default class ServerService {
  public static async getServers(abortSignal?: AbortSignal): Promise<Server[]> {
    const response = await MsalApiClient.get(`/api/witsml-servers`, abortSignal, MsalAuthConfig.WITSML_AUTHENTICATION_REQUIRED);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async addServer(server: Server, abortSignal?: AbortSignal): Promise<Server> {
    const response = await ApiClient.post(`/api/witsml-servers`, JSON.stringify(server), abortSignal, AuthConfig.NO_WITSML_AUTHENTICATION_REQUIRED);
    if (response.ok) {
      return response.json();
    } else {
      return emptyServer();
    }
  }

  public static async updateServer(server: Server, abortSignal?: AbortSignal): Promise<Server> {
    const response = await ApiClient.patch(`/api/witsml-servers/${server.id}`, JSON.stringify(server), abortSignal, AuthConfig.NO_WITSML_AUTHENTICATION_REQUIRED);
    if (response.ok) {
      return response.json();
    } else {
      return emptyServer();
    }
  }

  public static async removeServer(serverUid: string, abortSignal?: AbortSignal): Promise<boolean> {
    const response = await ApiClient.delete(`/api/witsml-servers/${serverUid}`, abortSignal, AuthConfig.NO_WITSML_AUTHENTICATION_REQUIRED);
    if (response.ok) {
      return true;
    } else {
      const { message }: ErrorDetails = await response.json();
      this.throwError(response.status, message);
    }
  }

  private static throwError(statusCode: number, message: string) {
    switch (statusCode) {
      case 401:
      case 404:
      case 500:
        throw new Error(message);
      default:
        throw new Error(`Something unexpected has happened.`);
    }
  }
}
