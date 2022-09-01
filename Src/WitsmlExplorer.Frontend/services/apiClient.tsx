import { msalEnabled } from "../msal/MsalAuthProvider";
import BasicClient from "./basicClient";
import { BasicServerCredentials } from "./credentialsService";
import MsalApiClient from "./msalApiClient";

export let ApiClient: IApiClient;

if (msalEnabled) {
  ApiClient = MsalApiClient;
} else {
  ApiClient = BasicClient;
}

export interface IApiClient {
  get: (pathName: string, abortSignal?: AbortSignal | null, currentCredentials?: BasicServerCredentials[], authConfig?: AuthConfig) => Promise<Response>;
  post: (pathName: string, body: string, abortSignal?: AbortSignal | null, currentCredentials?: BasicServerCredentials[], authConfig?: AuthConfig) => Promise<Response>;
  patch: (pathName: string, body: string, abortSignal?: AbortSignal | null, authConfig?: AuthConfig) => Promise<Response>;
  delete: (pathName: string, abortSignal?: AbortSignal | null, authConfig?: AuthConfig) => Promise<Response>;
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

export enum AuthConfig {
  WITSML_AUTHENTICATION_REQUIRED,
  NO_WITSML_AUTHENTICATION_REQUIRED
}
