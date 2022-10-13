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

  public clearPasswords() {
    this.credentials = this.credentials.map((creds) => {
      return { server: creds.server };
    });
    this._onCredentialStateChanged.dispatch({ server: this.server, hasPassword: this.isAuthorizedForServer(this.server) });
  }

  public isAuthorizedForServer(server: Server): boolean {
    if (msalEnabled && server?.securityscheme == SecurityScheme.OAuth2 && getUserAppRoles().some((x) => server.roles.includes(x))) {
      return true;
    }
    return this.credentials.find((c) => c.server.id === server?.id)?.password !== undefined;
  }

  public hasPasswordForUrl(serverUrl: string) {
    return this.credentials.find((c) => c.server.url === serverUrl)?.password !== undefined;
  }

  public async verifyCredentials(credentials: BasicServerCredentials, abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.get(`/api/credentials/authorize`, abortSignal, [credentials]);
    if (response.ok) {
      return response.json();
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
