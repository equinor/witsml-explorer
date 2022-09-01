import fetch from "isomorphic-unfetch";
import { getAccessToken } from "../msal/MsalAuthProvider";
import { getBaseUrl } from "./apiClient";

import CredentialsService, { BasicServerCredentials } from "./credentialsService";

export default class ApiClientMsal {
  static async getCommonHeaders(servers: BasicServerCredentials[]): Promise<HeadersInit> {
    const token = await getAccessToken([`${process.env.NEXT_PUBLIC_AZURE_AD_SCOPE_API}`]);
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Witsml-ServerUrl": servers[0]?.server.url.toString() ?? "",
      "Witsml-Source-ServerUrl": servers[1]?.server.url.toString() ?? ""
    };
  }

  public static async get(pathName: string, abortSignal: AbortSignal | null = null, currentCredentials = CredentialsService.getCredentials()): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await ApiClientMsal.getCommonHeaders(currentCredentials)
    };
    return ApiClientMsal.runHttpRequest(pathName, requestInit);
  }

  public static async post(pathName: string, body: string, abortSignal: AbortSignal | null = null, currentCredentials = CredentialsService.getCredentials()): Promise<Response> {
    const requestInit = {
      signal: abortSignal,
      method: "POST",
      body: body,
      headers: await ApiClientMsal.getCommonHeaders(currentCredentials)
    };
    return ApiClientMsal.runHttpRequest(pathName, requestInit);
  }

  public static async patch(pathName: string, body: string, abortSignal: AbortSignal | null = null): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "PATCH",
      body: body,
      headers: await ApiClientMsal.getCommonHeaders(currentCredentials)
    };

    return ApiClientMsal.runHttpRequest(pathName, requestInit);
  }

  public static async delete(pathName: string, abortSignal: AbortSignal | null = null): Promise<Response> {
    const currentCredentials = CredentialsService.getCredentials();
    const requestInit = {
      signal: abortSignal,
      method: "DELETE",
      headers: await ApiClientMsal.getCommonHeaders(currentCredentials)
    };

    return ApiClientMsal.runHttpRequest(pathName, requestInit);
  }

  private static runHttpRequest(pathName: string, requestInit: RequestInit) {
    return new Promise<Response>((resolve, reject) => {
      if (!("Authorization" in requestInit.headers)) {
        reject("Not authorized");
      }

      const url = new URL(ApiClientMsal.getBasePathName() + pathName, getBaseUrl());

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
