import { getAccessToken, msalEnabled, SecurityScheme } from "../msal/MsalAuthProvider";

import CredentialsService, { BasicServerCredentials } from "./credentialsService";

export class ApiClient {
  static async getCommonHeaders(credentials: BasicServerCredentials[]): Promise<HeadersInit> {
    const authorizationHeader = await this.getAuthorizationHeader(credentials);
    return {
      "Content-Type": "application/json",
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      "Witsml-ServerUrl": credentials[0]?.server?.url.toString() ?? "",
      "Witsml-Source-ServerUrl": credentials[1]?.server?.url.toString() ?? ""
    };
  }

  private static async getAuthorizationHeader(credentials: BasicServerCredentials[]): Promise<string | null> {
    if (msalEnabled) {
      const token = await getAccessToken([`${process.env.NEXT_PUBLIC_AZURE_AD_SCOPE_API}`]);
      return `Bearer ${token}`;
    } else {
      const hasCredentials = credentials[0] !== undefined && credentials[0].password !== undefined;
      if (!hasCredentials) {
        return null;
      }
      const credentialsStrings = credentials.map(({ username, password }) => `${username}:${password}`);
      return "Basic " + btoa(credentialsStrings.join(":"));
    }
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    currentCredentials = CredentialsService.getCredentials(),
    authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await ApiClient.getCommonHeaders(currentCredentials)
    };

    return ApiClient.runHttpRequest(pathName, requestInit, authConfig, currentCredentials);
  }

  public static async post(
    pathName: string,
    body: string,
    abortSignal: AbortSignal | null = null,
    currentCredentials: BasicServerCredentials[] = CredentialsService.getCredentials(),
    authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED
  ): Promise<Response> {
    const requestInit = {
      signal: abortSignal,
      method: "POST",
      body: body,
      headers: await ApiClient.getCommonHeaders(currentCredentials)
    };
    return ApiClient.runHttpRequest(pathName, requestInit, authConfig, currentCredentials);
  }

  public static async patch(pathName: string, body: string, abortSignal: AbortSignal | null = null, authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "PATCH",
      body: body,
      headers: await ApiClient.getCommonHeaders(currentCredentials)
    };

    return ApiClient.runHttpRequest(pathName, requestInit, authConfig, currentCredentials);
  }

  public static async delete(pathName: string, abortSignal: AbortSignal | null = null, authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "DELETE",
      headers: await ApiClient.getCommonHeaders(currentCredentials)
    };

    return ApiClient.runHttpRequest(pathName, requestInit, authConfig, currentCredentials);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit, authConfig: AuthConfig, credentials: BasicServerCredentials[]) {
    return new Promise<Response>((resolve, reject) => {
      if (!("Authorization" in requestInit.headers)) {
        if (msalEnabled || authConfig === AuthConfig.WITSML_AUTHENTICATION_REQUIRED) {
          reject("Not authorized");
        }
      }

      const url = new URL(getBasePathName() + getApiPath(credentials) + pathName, getBaseUrl());

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

function getApiPath(credentials: BasicServerCredentials[]): string {
  if (msalEnabled) {
    if (credentials[0].server.securityscheme == SecurityScheme.OAuth2 || credentials[1]?.server?.securityscheme == SecurityScheme.OAuth2) {
      return ApiRoute.Api2;
    } else {
      return ApiRoute.Api;
    }
  } else {
    return ApiRoute.Api;
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

enum ApiRoute {
  Api = "/api",
  Api2 = "/api2"
}

export enum AuthConfig {
  WITSML_AUTHENTICATION_REQUIRED,
  NO_WITSML_AUTHENTICATION_REQUIRED
}
