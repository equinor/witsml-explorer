import { ErrorDetails } from "models/errorDetails";
import { Server } from "models/server";
import { ApiClient, throwError } from "services/apiClient";
import { AuthorizationClient } from "services/authorizationClient";
import { SimpleEventDispatcher } from "ste-simple-events";
import {
  STORAGE_KEEP_SERVER_CREDENTIALS,
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem
} from "tools/localStorageHelpers";

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

export interface ConnectionInformation {
  serverUrl: string;
  userName: string;
}

class AuthorizationService {
  private static _instance: AuthorizationService;
  private _onAuthorizationChange =
    new SimpleEventDispatcher<AuthorizationState>();
  private server?: Server;
  private _sourceServer?: Server;
  private serversAwaitingAuthorization: Server[] = [];

  public awaitServerAuthorization(server: Server) {
    this.serversAwaitingAuthorization.push(server);
  }

  public finishServerAuthorization(server: Server) {
    const index = this.serversAwaitingAuthorization.findIndex(
      (waitingServer) => waitingServer.id == server.id
    );
    if (index != -1) {
      this.serversAwaitingAuthorization.splice(index, 1);
    }
  }

  public serverIsAwaitingAuthorization(server: Server) {
    return (
      this.serversAwaitingAuthorization.find(
        (waitingServer) => waitingServer.id == server.id
      ) != undefined
    );
  }

  public setSelectedServer(server: Server) {
    this.server = server;
  }

  public get selectedServer(): Server {
    return { ...this.server };
  }

  public setSourceServer(server: Server) {
    this._sourceServer = server;
  }

  public get sourceServer(): Server {
    return { ...this._sourceServer };
  }

  public resetSourceServer() {
    this._sourceServer = null;
  }

  public onServerStateChange(server: Server) {
    if (this.selectedServer?.id == server.id) {
      this.setSelectedServer(server);
    }
    if (this.sourceServer?.id == server.id) {
      this.setSourceServer(server);
    }
  }

  public onAuthorized(server: Server, username: string) {
    server.currentUsername = username;
    if (server.usernames == null) {
      server.usernames = [];
    }
    if (!server.usernames.includes(username)) {
      server.usernames.push(username);
    }
    this.onServerStateChange(server);
    this._onAuthorizationChange.dispatch({
      server,
      status: AuthorizationStatus.Authorized
    });
  }

  public getKeepLoggedInToServer(serverUrl: string): boolean {
    return (
      getLocalStorageItem<string>(
        serverUrl + STORAGE_KEEP_SERVER_CREDENTIALS
      ) == "keep"
    );
  }

  // Verify basic credentials for the first time
  // Basic credentials for this call will be set in header: WitsmlAuth
  public async verifyCredentials(
    credentials: BasicServerCredentials,
    keep: boolean,
    abortSignal?: AbortSignal
  ): Promise<any> {
    if (keep) {
      setLocalStorageItem<string>(
        credentials.server.url + STORAGE_KEEP_SERVER_CREDENTIALS,
        "keep"
      );
    } else {
      removeLocalStorageItem(
        credentials.server.url + STORAGE_KEEP_SERVER_CREDENTIALS
      );
    }
    const response = await AuthorizationClient.get(
      `/api/credentials/authorize?keep=` + keep,
      abortSignal,
      credentials
    );
    if (!response.ok) {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public async deauthorize(abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(
      `/api/credentials/deauthorize`,
      abortSignal
    );
    if (!response.ok) {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public async verifyuserisloggedin(
    connectionInfo: ConnectionInformation,
    abortSignal?: AbortSignal
  ): Promise<any> {
    const response = await ApiClient.post(
      `/api/credentials/verifyuserisloggedin`,
      JSON.stringify(connectionInfo),
      abortSignal
    );
    if (!response.ok) {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
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

export default AuthorizationService.Instance;
