import { ErrorDetails } from "../models/errorDetails";
import { emptyServer, Server } from "../models/server";
import ApiClientMsal from "./apiClientMsal";

export default class MsalServerService {
  public static async getServers(abortSignal?: AbortSignal): Promise<Server[]> {
    const response = await ApiClientMsal.get(`/api/witsml-servers`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async addServer(server: Server, abortSignal?: AbortSignal): Promise<Server> {
    const response = await ApiClientMsal.post(`/api/witsml-servers`, JSON.stringify(server), abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyServer();
    }
  }

  public static async updateServer(server: Server, abortSignal?: AbortSignal): Promise<Server> {
    const response = await ApiClientMsal.patch(`/api/witsml-servers/${server.id}`, JSON.stringify(server), abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyServer();
    }
  }

  public static async removeServer(serverUid: string, abortSignal?: AbortSignal): Promise<boolean> {
    const response = await ApiClientMsal.delete(`/api/witsml-servers/${serverUid}`, abortSignal);
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
