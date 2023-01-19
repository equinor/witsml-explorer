import { ApiClient } from "./apiClient";

import { BasicServerCredentials } from "./authorizationService";

export class AuthorizationClient {
  private static async getHeaders(credentials: BasicServerCredentials[]): Promise<HeadersInit> {
    const authorizationHeader = await ApiClient.getAuthorizationHeader();
    return {
      "Content-Type": "application/json",
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      "WitsmlTargetServer": this.getServerHeader(credentials[0]),
      "WitsmlSourceServer": this.getServerHeader(credentials[1])
    };
  }

  private static getServerHeader(credentials: BasicServerCredentials | undefined): string {
    if (!credentials) {
      return "";
    }
    return btoa(credentials.username + ":" + credentials.password) + "@" + credentials.server.url.toString();
  }

  public static async get(pathName: string, abortSignal: AbortSignal | null = null, targetCredentials: BasicServerCredentials): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await AuthorizationClient.getHeaders([targetCredentials]),
      credentials: "include"
    };

    return ApiClient.runHttpRequest(pathName, requestInit, undefined, undefined, false);
  }
}
