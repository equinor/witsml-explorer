import { ApiClient } from "./apiClient";

import { BasicServerCredentials } from "./credentialsService";

export class AuthorizationClient {
  private static async getHeaders(credentials: BasicServerCredentials[], serverOnly: boolean): Promise<HeadersInit> {
    const authorizationHeader = await ApiClient.getAuthorizationHeader();
    return {
      "Content-Type": "application/json",
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      "WitsmlTargetServer": this.getServerHeader(credentials[0], serverOnly),
      "WitsmlSourceServer": this.getServerHeader(credentials[1], serverOnly)
    };
  }

  private static getServerHeader(credentials: BasicServerCredentials | undefined, serverOnly: boolean): string {
    let result = "";
    if (!credentials) {
      return result;
    }
    if (!serverOnly) {
      result = btoa(credentials.username + ":" + credentials.password) + "@";
    }
    result += credentials.server.url.toString();
    return result;
  }

  public static async get(pathName: string, abortSignal: AbortSignal | null = null, targetCredentials: BasicServerCredentials): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await AuthorizationClient.getHeaders([targetCredentials], false),
      credentials: "include"
    };

    return ApiClient.runHttpRequest(pathName, requestInit, undefined, undefined, false);
  }
}
