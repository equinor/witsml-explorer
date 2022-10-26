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
  type: "Session" | "Persistent" | "Invalid";
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

  // public clearPasswords() {
  //   this.credentials = this.credentials.map((creds) => {
  //     if (this.hasValidCookieForServer(creds.server.url)) {
  //       return creds;
  //     }
  //     return { server: creds.server };
  //   });
  //   if (!this.hasValidCookieForServer(this.server.url)) {
  //     this._onCredentialStateChanged.dispatch({ server: this.server, hasPassword: this.isAuthorizedForServer(this.server) });
  //   }
  // }

  public isAuthorizedForServer(server: Server): boolean {
    if (msalEnabled && server?.securityscheme == SecurityScheme.OAuth2 && getUserAppRoles().some((x) => server.roles.includes(x))) {
      return true;
    }
    return this.hasValidCookieForServer(server?.url);
    //return this.credentials.find((c) => c.server.id === server?.id)?.password !== undefined;
  }

  // public hasPasswordForUrl(serverUrl: string) {
  //   return this.credentials.find((c) => c.server.url === serverUrl)?.password !== undefined;
  // }

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

  // public keepLoggedInToServer(serverUrl: string): boolean {
  //   return !!localStorage.getItem(serverUrl) && localStorage.getItem(serverUrl);
  // }

  // Verify basic credentials for the first time
  // Basic credentials for this call will be set in header: WitsmlTargetServer
  public async verifyCredentials(credentials: BasicServerCredentials, keep: boolean, abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/authorize?keep=` + keep, abortSignal, [credentials], true, false);
    if (response.ok) {
      const offset = keep ? 24 : 1;
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + offset);
      const cookieInfo = { type: keep ? "Persistent" : "Session", expiry: expirationTime };
      localStorage.setItem(credentials.server.url, JSON.stringify(cookieInfo));
    } else {
      const { message }: ErrorDetails = await response.json();
      CredentialsService.throwError(response.status, message);
    }
  }

  // public async verifyCredentialsWithCookie(credentials: BasicServerCredentials, abortSignal?: AbortSignal): Promise<BasicServerCredentials> {
  //   const response = await ApiClient.get(`/api/credentials/authorizewithcookie`, abortSignal, [credentials], true);
  //   if (response.ok) {
  //     const cookie = await response.json();
  //     const decoded = Buffer.from(cookie, "base64").toString();
  //     const creds = decoded.split(":");
  //     return {
  //       server: credentials.server,
  //       username: creds[0],
  //       password: creds[1]
  //     };
  //   } else {
  //     const { message }: ErrorDetails = await response.json();
  //     CredentialsService.throwError(response.status, message);
  //   }
  // }

  // public async verifyCredentialsAndSetCookie(credentials: BasicServerCredentials, abortSignal?: AbortSignal): Promise<any> {
  //   const response = await ApiClient.get(`/api/credentials/authorizeandsetcookie`, abortSignal, [credentials], true);
  //   if (response.ok) {
  //     const expirationTime = new Date();
  //     expirationTime.setDate(expirationTime.getDate() + 1);
  //     localStorage.setItem(credentials.server.url, expirationTime.toJSON());
  //     return response.json();
  //   } else {
  //     const { message }: ErrorDetails = await response.json();
  //     CredentialsService.throwError(response.status, message);
  //   }
  // }

  public async deauthorize(abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/deauthorize`, abortSignal, undefined, true);
    if (response.ok) {
      // set times on all existing local storage server values to indicate that the respective cookies are no longer valid
      this.credentials.forEach((creds) => {
        if (localStorage.getItem(creds.server.url)) {
          const cInfo: CookieInfo = { type: "Invalid", expiry: new Date().toJSON() };
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
