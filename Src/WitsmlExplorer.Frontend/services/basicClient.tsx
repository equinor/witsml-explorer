import fetch from "isomorphic-unfetch";
import { getBaseUrl } from "./apiClient";
import CredentialsService, { BasicServerCredentials } from "./credentialsService";

export default class BasicClient {
  static getCommonHeaders(credentials: BasicServerCredentials[]): HeadersInit {
    const hasCredentials = credentials[0] !== undefined && credentials[0].password !== undefined;
    return {
      "Content-Type": "application/json",
      ...(hasCredentials ? { Authorization: this.createAuthorizationString(credentials) } : {}),
      "Witsml-ServerUrl": credentials[0]?.server?.url.toString() ?? "",
      "Witsml-Source-ServerUrl": credentials[1]?.server?.url.toString() ?? ""
    };
  }

  private static createAuthorizationString(credentials: BasicServerCredentials[]): string {
    const credentialsStrings = credentials.map(({ username, password }) => `${username}:${password}`);
    return "Basic " + btoa(credentialsStrings.join(":"));
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    currentCredentials = CredentialsService.getCredentials(),
    authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: BasicClient.getCommonHeaders(currentCredentials)
    };

    return BasicClient.runHttpRequest(pathName, requestInit, authConfig);
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
      headers: BasicClient.getCommonHeaders(currentCredentials)
    };
    return BasicClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  public static async patch(pathName: string, body: string, abortSignal: AbortSignal | null = null, authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "PATCH",
      body: body,
      headers: BasicClient.getCommonHeaders(currentCredentials)
    };

    return BasicClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  public static async delete(pathName: string, abortSignal: AbortSignal | null = null, authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "DELETE",
      headers: BasicClient.getCommonHeaders(currentCredentials)
    };

    return BasicClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit, authConfig: AuthConfig) {
    return new Promise<Response>((resolve, reject) => {
      if (authConfig === AuthConfig.WITSML_AUTHENTICATION_REQUIRED && !("Authorization" in requestInit.headers)) {
        reject("Not authorized");
      }

      const url = new URL(BasicClient.getBasePathName() + pathName, getBaseUrl());

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
    const basePathName = getBaseUrl().pathname;
    return basePathName !== "/" ? basePathName : "";
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
