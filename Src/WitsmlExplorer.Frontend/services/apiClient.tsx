import fetch from "isomorphic-unfetch";
import CredentialsService, { ServerCredentials } from "./credentialsService";

export default class ApiClient {
  static getCommonHeaders(credentials: ServerCredentials[]): HeadersInit {
    const hasCredentials = credentials[0] !== undefined && credentials[0].password !== undefined;
    return {
      "Content-Type": "application/json",
      ...(hasCredentials ? { Authorization: this.createAuthorizationString(credentials) } : {}),
      "Witsml-ServerUrl": credentials[0]?.server?.url.toString() ?? "",
      "Witsml-Source-ServerUrl": credentials[1]?.server?.url.toString() ?? ""
    };
  }

  private static createAuthorizationString(credentials: ServerCredentials[]): string {
    const credentialsStrings = credentials.map(({ username, password }) => `${username}:${password}`);
    return "Basic " + btoa(credentialsStrings.join(":"));
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED,
    currentCredentials = CredentialsService.getCredentials()
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: this.getCommonHeaders(currentCredentials)
    };

    return ApiClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  public static async post(
    pathName: string,
    body: string,
    abortSignal: AbortSignal | null = null,
    authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED,
    currentCredentials: ServerCredentials[] = CredentialsService.getCredentials()
  ): Promise<Response> {
    const requestInit = {
      signal: abortSignal,
      method: "POST",
      body: body,
      headers: this.getCommonHeaders(currentCredentials)
    };
    return ApiClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  public static async patch(pathName: string, body: string, abortSignal: AbortSignal | null = null, authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "PATCH",
      body: body,
      headers: this.getCommonHeaders(currentCredentials)
    };

    return ApiClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  public static async delete(pathName: string, abortSignal: AbortSignal | null = null, authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "DELETE",
      headers: this.getCommonHeaders(currentCredentials)
    };

    return ApiClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit, authConfig: AuthConfig) {
    return new Promise<Response>((resolve, reject) => {
      if (authConfig === AuthConfig.WITSML_AUTHENTICATION_REQUIRED && !("Authorization" in requestInit.headers)) {
        reject("Not authorized");
      }

      const url = new URL(ApiClient.getBasePathName() + pathName, ApiClient.getBaseUrl());

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

  private static getBasePathName(): string {
    const basePathName = ApiClient.getBaseUrl().pathname;
    return basePathName !== "/" ? basePathName : "";
  }

  public static getBaseUrl(): URL {
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
}

export function truncateAbortHandler(e: Error): void {
  if (e.name === "AbortError") {
    return;
  }
  throw e;
}

export enum AuthConfig {
  WITSML_AUTHENTICATION_REQUIRED,
  NO_WITSML_AUTHENTICATION_REQUIRED
}
