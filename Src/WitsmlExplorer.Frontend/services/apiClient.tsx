import { Server } from "models/server";
import { getAccessToken, msalEnabled } from "msal/MsalAuthProvider";

import AuthorizationService, {
  AuthorizationStatus
} from "services/authorizationService";
import { isDesktopApp } from "tools/desktopAppHelpers";

export class ApiClient {
  private static async getCommonHeaders(
    targetServer: Server = undefined,
    sourceServer: Server = undefined
  ): Promise<HeadersInit> {
    const authorizationHeader = await ApiClient.getAuthorizationHeader();
    return {
      "Content-Type": "application/json",
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      "WitsmlTargetServer": ApiClient.getServerHeader(targetServer),
      "WitsmlSourceServer": ApiClient.getServerHeader(sourceServer),
      "WitsmlTargetUsername": ApiClient.getUsernameHeader(targetServer),
      "WitsmlSourceUsername": ApiClient.getUsernameHeader(sourceServer)
    };
  }

  private static getServerHeader(server: Server | undefined): string {
    return server?.url == null ? "" : server.url.toString();
  }

  private static getUsernameHeader(server: Server | undefined): string {
    return server?.currentUsername == null ? "" : server.currentUsername;
  }

  public static async getAuthorizationHeader(): Promise<string | null> {
    if (msalEnabled) {
      const token = await getAccessToken([
        `${import.meta.env.VITE_AZURE_AD_SCOPE_API}`
      ]);
      return `Bearer ${token}`;
    }
    return null;
  }

  public static async get(
    pathName: string,
    abortSignal: AbortSignal | null = null,
    server = AuthorizationService.selectedServer
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      headers: await ApiClient.getCommonHeaders(server),
      credentials: "include"
    };

    return ApiClient.runHttpRequest(pathName, requestInit, server);
  }

  public static async post(
    pathName: string,
    body: string,
    abortSignal: AbortSignal | null = null,
    targetServer = AuthorizationService.selectedServer,
    sourceServer = AuthorizationService.sourceServer
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      method: "POST",
      body: body,
      headers: await ApiClient.getCommonHeaders(targetServer, sourceServer),
      credentials: "include"
    };
    return ApiClient.runHttpRequest(
      pathName,
      requestInit,
      targetServer,
      sourceServer
    );
  }

  public static async patch(
    pathName: string,
    body: string,
    abortSignal: AbortSignal | null = null,
    targetServer = AuthorizationService.selectedServer,
    sourceServer = AuthorizationService.sourceServer
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      method: "PATCH",
      body: body,
      headers: await ApiClient.getCommonHeaders(targetServer, sourceServer),
      credentials: "include"
    };

    return ApiClient.runHttpRequest(pathName, requestInit);
  }

  public static async delete(
    pathName: string,
    abortSignal: AbortSignal | null = null
  ): Promise<Response> {
    const requestInit: RequestInit = {
      signal: abortSignal,
      method: "DELETE",
      headers: await ApiClient.getCommonHeaders(),
      credentials: "include"
    };

    return ApiClient.runHttpRequest(pathName, requestInit);
  }

  public static async runHttpRequest(
    pathName: string,
    requestInit: RequestInit,
    targetServer: Server = undefined,
    sourceServer: Server = undefined,
    rerun = true
  ): Promise<Response> {
    const baseUrl = await getBaseUrl();
    const url = new URL((await getBasePathName()) + pathName, baseUrl);
    return new Promise<Response>((resolve, reject) => {
      if (!("Authorization" in requestInit.headers)) {
        if (msalEnabled) {
          reject("Not authorized");
        }
      }
      this.fetchWithRerun(
        url,
        requestInit,
        targetServer,
        sourceServer,
        rerun,
        resolve,
        reject
      );
    });
  }

  private static fetchWithRerun(
    url: URL,
    requestInit: RequestInit,
    targetServer: Server,
    sourceServer: Server,
    rerun: boolean,
    resolve: (value: Response | PromiseLike<Response>) => void,
    reject: (reason?: any) => void
  ) {
    fetch(url.toString(), requestInit)
      .then((response) => {
        if (response.status == 401 && rerun) {
          this.handleUnauthorized(
            url,
            requestInit,
            targetServer,
            sourceServer,
            response,
            resolve,
            reject
          );
        } else {
          resolve(response);
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        reject(error);
      });
  }

  private static async handleUnauthorized(
    url: URL,
    requestInit: RequestInit,
    targetServer: Server,
    sourceServer: Server,
    originalResponse: Response,
    resolve: (value: Response | PromiseLike<Response>) => void,
    reject: (reason?: any) => void
  ) {
    let result;
    try {
      result = await originalResponse.clone().json();
    } catch {
      resolve(originalResponse);
      return;
    }
    const server: "Target" | "Source" | undefined = result.server;
    const serverToAuthorize = server == "Source" ? sourceServer : targetServer;
    if (serverToAuthorize == null) {
      resolve(originalResponse);
      return;
    }
    const unsub = AuthorizationService.onAuthorizationChangeEvent.subscribe(
      async (authorizationState) => {
        if (authorizationState.status == AuthorizationStatus.Cancel) {
          unsub();
          resolve(originalResponse);
        } else if (
          authorizationState.status == AuthorizationStatus.Authorized &&
          authorizationState.server.id == serverToAuthorize.id
        ) {
          unsub();
          const updatedTargetServer =
            server == "Target" ? authorizationState.server : targetServer;
          const updatedSourceServer =
            server == "Source" ? authorizationState.server : sourceServer;
          // recalculate headers because the usernames might have changed
          requestInit.headers = await ApiClient.getCommonHeaders(
            updatedTargetServer,
            updatedSourceServer
          );
          this.fetchWithRerun(
            url,
            requestInit,
            updatedTargetServer,
            updatedSourceServer,
            true,
            resolve,
            reject
          );
        }
      }
    );
    AuthorizationService.onAuthorizationChangeDispatch({
      server: serverToAuthorize,
      status: AuthorizationStatus.Unauthorized
    });
  }
}

async function getBasePathName(): Promise<string> {
  const baseUrl = await getBaseUrl();
  const basePathName = baseUrl.pathname;
  return basePathName !== "/" ? basePathName : "";
}

export async function getBaseUrl(): Promise<URL> {
  let baseUrl: URL;
  try {
    const configuredUrl = import.meta.env.VITE_WITSMLEXPLORER_API_URL;
    if (isDesktopApp()) {
      // @ts-ignore
      const config = await window.electronAPI.getConfig();
      baseUrl = new URL(`http://localhost:${config.apiPort}`);
    } else if (configuredUrl && configuredUrl.length > 0) {
      baseUrl = new URL(configuredUrl);
    } else {
      const protocol = window.location.protocol.slice(0, -1);
      const host = window.location.hostname;
      const port = window.location.port === "3000" ? ":5000" : "";
      baseUrl = new URL(`${protocol}://${host}${port}`);
    }
  } catch (e) {
    console.error(e);
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

export function throwError(statusCode: number, message: string) {
  switch (statusCode) {
    case 401:
    case 403:
    case 404:
    case 500:
    case 502:
    case 504:
      throw new Error(message);
    default:
      throw new Error(`Something unexpected has happened.`);
  }
}
