import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import { ApiClient, throwError } from "services/apiClient";

export default class ServerService {
  public static async getServers(abortSignal?: AbortSignal): Promise<Server[]> {
    const response = await ApiClient.get(
      `/api/witsml-servers`,
      abortSignal,
      undefined
    );
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async addServer(
    server: Server,
    abortSignal?: AbortSignal
  ): Promise<Server> {
    const response = await ApiClient.post(
      `/api/witsml-servers`,
      JSON.stringify(server),
      abortSignal,
      undefined
    );
    if (response.ok) {
      return await response.json();
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async updateServer(
    server: Server,
    abortSignal?: AbortSignal
  ): Promise<Server> {
    const response = await ApiClient.patch(
      `/api/witsml-servers/${server.id}`,
      JSON.stringify(server),
      abortSignal
    );
    if (response.ok) {
      return await response.json();
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async removeServer(
    serverUid: string,
    abortSignal?: AbortSignal
  ): Promise<boolean> {
    const response = await ApiClient.delete(
      `/api/witsml-servers/${serverUid}`,
      abortSignal
    );
    if (response.ok) {
      return true;
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }
}
