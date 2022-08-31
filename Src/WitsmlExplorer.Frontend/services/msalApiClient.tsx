import fetch from "isomorphic-unfetch";
import { getIdToken } from "../msal/MsalAuthProvider";

import CredentialsService, { BasicServerCredentials } from "./credentialsService";

export default class MsalApiClient {
  static async getCommonHeaders(servers: BasicServerCredentials[]) {
    const token = await getIdToken([]);
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Witsml-ServerUrl": servers[0]?.server.url.toString() ?? "",
      "Witsml-Source-ServerUrl": servers[1]?.server.url.toString() ?? ""
    };
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    authConfig = MsalAuthConfig.AUTHENTICATION_REQUIRED,
    currentCredentials = CredentialsService.getCredentials()
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await MsalApiClient.getCommonHeaders(currentCredentials)
    };
    return MsalApiClient.runHttpRequest(pathName, requestInit, authConfig);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit, authConfig: MsalAuthConfig) {
    return new Promise<Response>((resolve, reject) => {
      if (authConfig === MsalAuthConfig.AUTHENTICATION_REQUIRED && !("Authorization" in requestInit.headers)) {
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

export enum MsalAuthConfig {
  WITSML_AUTHENTICATION_REQUIRED,
  NO_WITSML_AUTHENTICATION_REQUIRED,
  AUTHENTICATION_REQUIRED
}
