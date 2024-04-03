import { Buffer } from "buffer";
import { ApiClient } from "services/apiClient";

import { BasicServerCredentials } from "services/authorizationService";

export class AuthorizationClient {
  private static async getHeaders(
    credentials: BasicServerCredentials[]
  ): Promise<HeadersInit> {
    const authorizationHeader = await ApiClient.getAuthorizationHeader();
    return {
      "Content-Type": "application/json",
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      "WitsmlAuth": this.getServerHeader(credentials[0])
    };
  }

  private static getServerHeader(
    credentials: BasicServerCredentials | undefined
  ): string {
    if (!credentials) {
      return "";
    }
    return (
      Buffer.from(credentials.username + ":" + credentials.password).toString(
        "base64"
      ) +
      "@" +
      credentials.server.url.toString()
    );
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    targetCredentials: BasicServerCredentials
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await AuthorizationClient.getHeaders([targetCredentials]),
      credentials: "include"
    };

    return ApiClient.runHttpRequest(
      pathName,
      requestInit,
      undefined,
      undefined,
      false
    );
  }
}
