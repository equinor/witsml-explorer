import { SimpleEventDispatcher } from "ste-simple-events";
import { UpdateServerAction } from "../contexts/modificationActions";
import ModificationType from "../contexts/modificationType";
import { ErrorDetails } from "../models/errorDetails";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";
import { AuthorizationClient } from "./authorizationClient";

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
  private _onAuthorizationChange = new SimpleEventDispatcher<AuthorizationState>();
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
  }

  public get selectedServer(): Server {
    return { ...this.server };
  }

  public setSourceServer(server: Server) {
    this.sourceServer = server;
  }

  public getSourceServer(): Server {
    return { ...this.sourceServer };
  }

  public resetSourceServer() {
    this.sourceServer = null;
  }

  public onAuthorized(server: Server, username: string, dispatchNavigation: (action: UpdateServerAction) => void) {
    // TODO: username on first login with system user is not set yet, will be fixed as part of WE-749
    server.username = username;
    dispatchNavigation({ type: ModificationType.UpdateServer, payload: { server } });
    this._onAuthorizationChange.dispatch({ server, status: AuthorizationStatus.Authorized });
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
    const response = await AuthorizationClient.get(`/api/credentials/authorize?keep=` + keep, abortSignal, credentials);
    if (!response.ok) {
      const { message }: ErrorDetails = await response.json();
      CredentialsService.throwError(response.status, message);
    }
  }

  public async deauthorize(abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/deauthorize`, abortSignal);
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

  public onAuthorizationChangeDispatch(authorizationState: AuthorizationState) {
    return this._onAuthorizationChange.dispatch(authorizationState);
  }

  public get onAuthorizationChangeEvent() {
    return this._onAuthorizationChange.asEvent();
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export default CredentialsService.Instance;
