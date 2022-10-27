import { SimpleEventDispatcher } from "ste-simple-events";
import { ErrorDetails } from "../models/errorDetails";
import { Server } from "../models/server";
import { getUserAppRoles, msalEnabled, SecurityScheme } from "../msal/MsalAuthProvider";
import { ApiClient } from "./apiClient";

export interface BasicServerCredentials {
  server: Server;
  username?: string;
  password?: string;
}

type CookieInfo = {
  type: "WExSession" | "WExPersistent" | "WExInvalid";
  url: string;
  expiry: string;
};
class CredentialsService {
  private static _instance: CredentialsService;
  private _onCredentialStateChanged = new SimpleEventDispatcher<{ server: Server; hasPassword: boolean }>();
  private credentials: BasicServerCredentials[] = [];
  private server?: Server;
  private sourceServer?: Server;

  public setSelectedServer(server: Server) {
    this.server = server;
    this._onCredentialStateChanged.dispatch({ server: server, hasPassword: this.isAuthorizedForServer(server) });
  }

  public setSourceServer(server: Server) {
    this.sourceServer = server;
  }

  public resetSourceServer() {
    this.sourceServer = null;
  }

  public addServer(server: Server) {
    this.credentials.push({ server });
  }

  public removeServer(serverUid: string) {
    const index = this.credentials.findIndex((creds) => creds.server.id == serverUid);
    if (index > -1) {
      this.credentials.splice(index, 1);
    }
  }

  public updateServer(server: Server) {
    const creds = this.getCredentialsForServer(server);
    creds.server = server;
  }

  public saveServers(servers: Server[]) {
    this.credentials = servers.map((server) => {
      return {
        server
      };
    });
  }

  public saveCredentials(serverCredentials: BasicServerCredentials) {
    const index = this.credentials.findIndex((c) => c.server.id === serverCredentials.server.id);
    if (index === -1) {
      this.credentials.push(serverCredentials);
    } else {
      this.credentials[index] = serverCredentials;
    }
    this._onCredentialStateChanged.dispatch({ server: serverCredentials.server, hasPassword: Boolean(serverCredentials.password) });
  }

  public getCredentials(): BasicServerCredentials[] {
    const currentCredentials = this.credentials.find((c) => c.server.id === this.server?.id);
    const sourceCredentials = this.getSourceServerCredentials();
    return [...(currentCredentials ? [currentCredentials] : []), ...(sourceCredentials ? [sourceCredentials] : [])];
  }

  public getCredentialsForServer(server: Server): BasicServerCredentials {
    return this.credentials.find((c) => c.server.id === server.id);
  }

  public getSourceServerCredentials(): BasicServerCredentials | undefined {
    return this.credentials.find((c) => c.server.id === this.sourceServer?.id);
  }

  public isAuthorizedForServer(server: Server): boolean {
    if (msalEnabled && server?.securityscheme == SecurityScheme.OAuth2 && getUserAppRoles().some((x) => server.roles.includes(x))) {
      return true;
    }
    return this.hasValidCookieForServer(server?.url);
  }

  public hasValidCookieForServer(serverUrl: string): boolean {
    //use local storage to check whether the cookie is valid, because the cookie is httpOnly
    const cookieInfo = localStorage.getItem(serverUrl);
    if (!cookieInfo) {
      return false;
    } else {
      const cInfo: CookieInfo = JSON.parse(cookieInfo);
      return new Date().getTime() < new Date(cInfo.expiry).getTime();
    }
  }

  private isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  private allLocalStorage() {
    const values = [];
    const keys = Object.keys(localStorage);
    let i = keys.length;
    while (i--) {
      if (keys[i].startsWith("http") && this.isJsonString(localStorage.getItem(keys[i]))) {
        values.push(localStorage.getItem(keys[i]));
      }
    }
    return values;
  }

  // refresh timestamp for all "session" entries in localstorage, to match session cookies
  public refreshLocalstorageSessions() {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);
    const cookies: CookieInfo[] = this.allLocalStorage()
      .map((n) => JSON.parse(n))
      .filter((n) => n.type == "WExSession");
    cookies.forEach((element) => {
      const refreshedCookie = { type: "WExSession", url: element.url, expiry: expirationTime };
      localStorage.setItem(element.url, JSON.stringify(refreshedCookie));
    });
  }

  // Verify basic credentials for the first time
  // Basic credentials for this call will be set in header: WitsmlTargetServer
  public async verifyCredentials(credentials: BasicServerCredentials, keep: boolean, abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/authorize?keep=` + keep, abortSignal, [credentials], false);
    if (response.ok) {
      const offset = keep ? 24 : 1;
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + offset);
      const cookieInfo = { type: keep ? "WExPersistent" : "WExSession", url: credentials.server.url, expiry: expirationTime };
      localStorage.setItem(credentials.server.url, JSON.stringify(cookieInfo));
    } else {
      const { message }: ErrorDetails = await response.json();
      CredentialsService.throwError(response.status, message);
    }
  }

  public async deauthorize(abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/deauthorize`, abortSignal, undefined, true);
    if (response.ok) {
      // set times on all existing local storage server values to indicate that the respective cookies are no longer valid
      this.credentials.forEach((creds) => {
        if (localStorage.getItem(creds.server.url)) {
          const cInfo: CookieInfo = { type: "WExInvalid", url: creds.server.url, expiry: new Date().toJSON() };
          localStorage.setItem(creds.server.url, JSON.stringify(cInfo));
        }
      });
      return;
    } else {
      const { message }: ErrorDetails = await response.json();
      CredentialsService.throwError(response.status, message);
    }
  }

  private static throwError(statusCode: number, message: string) {
    switch (statusCode) {
      case 401:
      case 404:
      case 500:
        throw new Error(message);
      default:
        throw new Error(`Something unexpected has happened.`);
    }
  }

  public get onCredentialStateChanged() {
    return this._onCredentialStateChanged.asEvent();
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export default CredentialsService.Instance;
