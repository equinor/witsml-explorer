import { getAccessToken, msalEnabled } from "../msal/MsalAuthProvider";

import CredentialsService, { BasicServerCredentials } from "./credentialsService";

export class ApiClient {
  static async getCommonHeaders(credentials: BasicServerCredentials[], serverOnly: boolean): Promise<HeadersInit> {
    const authorizationHeader = await this.getAuthorizationHeader();
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

  private static async getAuthorizationHeader(): Promise<string | null> {
    if (msalEnabled) {
      const token = await getAccessToken([`${process.env.NEXT_PUBLIC_AZURE_AD_SCOPE_API}`]);
      return `Bearer ${token}`;
    }
    return null;
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    currentCredentials = CredentialsService.getCredentials(),
    includeCredentials = true,
    serverHeaderOnly = true
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await ApiClient.getCommonHeaders(currentCredentials, serverHeaderOnly),
      ...(includeCredentials ? { credentials: "include" } : {})
    };

    return ApiClient.runHttpRequest(pathName, requestInit);
  }

  public static async post(
    pathName: string,
    body: string,
    abortSignal: AbortSignal | null = null,
    currentCredentials: BasicServerCredentials[] = CredentialsService.getCredentials()
  ): Promise<Response> {
    const requestInit = {
      signal: abortSignal,
      method: "POST",
      body: body,
      headers: await ApiClient.getCommonHeaders(currentCredentials, true)
    };
    return ApiClient.runHttpRequest(pathName, requestInit);
  }

  public static async patch(pathName: string, body: string, abortSignal: AbortSignal | null = null): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "PATCH",
      body: body,
      headers: await ApiClient.getCommonHeaders(currentCredentials, true)
    };

    return ApiClient.runHttpRequest(pathName, requestInit);
  }

  public static async delete(pathName: string, abortSignal: AbortSignal | null = null): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "DELETE",
      headers: await ApiClient.getCommonHeaders(currentCredentials, true)
    };

    return ApiClient.runHttpRequest(pathName, requestInit);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit) {
    return new Promise<Response>((resolve, reject) => {
      if (!("Authorization" in requestInit.headers)) {
        if (msalEnabled) {
          reject("Not authorized");
        }
      }

      const url = new URL(getBasePathName() + pathName, getBaseUrl());

      fetch(url.toString(), requestInit)
        .then((response) => resolve(response))
        .catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
          reject(error);
        });
    });
  }
}

function getBasePathName(): string {
  const basePathName = getBaseUrl().pathname;
  return basePathName !== "/" ? basePathName : "";
}

export function getBaseUrl(): URL {
  let baseUrl: URL;
  try {
    const configuredUrl = process.env.WITSMLEXPLORER_API_URL;
    if (configuredUrl && configuredUrl.length > 0) {
      baseUrl = new URL(configuredUrl);
    } else {
      const protocol = window.location.protocol.slice(0, -1);
      const host = window.location.hostname;
      const port = window.location.port === "3000" ? ":5000" : "";
      baseUrl = new URL(`${protocol}://${host}${port}`);
    }
  } catch (e) {
    baseUrl = new URL("http://localhost");
  }
  return baseUrl;
}

export function truncateAbortHandler(e: Error): void {
  if (e.name === "AbortError") {
    return;
  }
  throw e;
}
