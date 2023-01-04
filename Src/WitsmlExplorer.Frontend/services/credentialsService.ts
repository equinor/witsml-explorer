import { SimpleEventDispatcher } from "ste-simple-events";
import { ErrorDetails } from "../models/errorDetails";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";

export interface BasicServerCredentials {
  server: Server;
  username?: string;
  password?: string;
}

export enum AuthorizationStatus {
  Unauthorized,
  Authorized,
  Cancel
}

export interface AuthorizationState {
  server: Server;
  status: AuthorizationStatus;
}

class CredentialsService {
  private static _instance: CredentialsService;
  private _onServerChanged = new SimpleEventDispatcher<{ server: Server }>();
  private _onAuthorizationChange = new SimpleEventDispatcher<AuthorizationState>();
  private credentials: BasicServerCredentials[] = [];
  private server?: Server;
  private sourceServer?: Server;
  private serversAwaitingAuthorization: Server[] = [];

  public awaitServerAuthorization(server: Server) {
    this.serversAwaitingAuthorization.push(server);
  }

  public finishServerAuthorization(server: Server) {
    const index = this.serversAwaitingAuthorization.findIndex((waitingServer) => waitingServer.id == server.id);
    if (index != -1) {
      this.serversAwaitingAuthorization.splice(index, 1);
    }
  }

  public serverIsAwaitingAuthorization(server: Server) {
    return this.serversAwaitingAuthorization.find((waitingServer) => waitingServer.id == server.id) != undefined;
  }

  public setSelectedServer(server: Server) {
    this.server = server;
    this._onServerChanged.dispatch({ server: server });
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
    this._onServerChanged.dispatch({ server: serverCredentials.server });
    this._onAuthorizationChange.dispatch({ server: serverCredentials.server, status: AuthorizationStatus.Authorized });
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

  public getKeepLoggedInToServer(serverUrl: string): boolean {
    try {
      return localStorage.getItem(serverUrl) == "keep";
    } catch {
      // ignore unavailable local storage
    }
    return false;
  }

  // Verify basic credentials for the first time
  // Basic credentials for this call will be set in header: WitsmlTargetServer
  public async verifyCredentials(credentials: BasicServerCredentials, keep: boolean, abortSignal?: AbortSignal): Promise<any> {
    try {
      if (keep) {
        localStorage.setItem(credentials.server.url, "keep");
      } else {
        localStorage.removeItem(credentials.server.url);
      }
    } catch {
      // ignore unavailable local storage
    }
    const response = await ApiClient.get(`/api/credentials/authorize?keep=` + keep, abortSignal, [credentials], false);
    if (!response.ok) {
      const { message }: ErrorDetails = await response.json();
      CredentialsService.throwError(response.status, message);
    }
  }

  public async deauthorize(abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/deauthorize`, abortSignal, undefined, true);
    if (!response.ok) {
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

  public get onServerChanged() {
    return this._onServerChanged.asEvent();
  }

  public get onAuthorizationChanged() {
    return this._onAuthorizationChange;
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export default CredentialsService.Instance;
