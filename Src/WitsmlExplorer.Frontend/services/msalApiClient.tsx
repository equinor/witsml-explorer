import fetch from "isomorphic-unfetch";
import { getAccessToken, msalEnabled } from "../msal/MsalAuthProvider";

import CredentialsService, { BasicServerCredentials } from "./credentialsService";

export default class MsalApiClient {
  static getCommonHeaders(servers: BasicServerCredentials[]): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(msalEnabled ? { Authorization: `Bearer ${getAccessToken([])}` } : {}),
      "Witsml-ServerUrl": servers[0]?.server.url.toString() ?? "",
      "Witsml-Source-ServerUrl": servers[1]?.server.url.toString() ?? ""
    };
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    authConfig = AuthConfig.WITSML_AUTHENTICATION_REQUIRED,
    currentCredentials = CredentialsService.getCredentials()
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: MsalApiClient.getCommonHeaders(currentCredentials)
    };
    return MsalApiClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit, authConfig: AuthConfig) {
    return new Promise<Response>((resolve, reject) => {
      if (authConfig === AuthConfig.WITSML_AUTHENTICATION_REQUIRED && !("Authorization" in requestInit.headers)) {
        reject("Not authorized");
      }

      const url = new URL(MsalApiClient.getBasePathName() + pathName, MsalApiClient.getBaseUrl());

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
    const basePathName = MsalApiClient.getBaseUrl().pathname;
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
