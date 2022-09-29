import { SimpleEventDispatcher } from "ste-simple-events";
import { ErrorDetails } from "../models/errorDetails";
import { Server } from "../models/server";
import { ApiClient } from "./apiClient";

export interface BasicServerCredentials {
  server: Server;
  username: string;
  password: string;
}

class CredentialsService {
  private static _instance: CredentialsService;
  private _onCredentialStateChanged = new SimpleEventDispatcher<{ server: Server; hasPassword: boolean }>();
  private credentials: BasicServerCredentials[];
  private server?: Server;
  private sourceServer?: Server;

  private constructor() {
    this.credentials = CredentialsService.getLocallyStoredServerUsernames();
  }

  public setSelectedServer(server: Server) {
    this.server = server;
    this._onCredentialStateChanged.dispatch({ server: server, hasPassword: this.hasPasswordForServer(server) });
  }

  public setSourceServer(server: Server) {
    this.sourceServer = server;
  }

  public resetSourceServer() {
    this.sourceServer = null;
  }

  public saveCredentials(serverCredentials: BasicServerCredentials) {
    const index = this.credentials.findIndex((c) => c.server.id === serverCredentials.server.id);
    if (index === -1) {
      this.credentials.push(serverCredentials);
    } else {
      this.credentials[index] = serverCredentials;
    }
    this.updateLocallyStoredServerUsernames();
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
    this.credentials = CredentialsService.getLocallyStoredServerUsernames();
    this._onCredentialStateChanged.dispatch({ server: this.server, hasPassword: this.hasPasswordForServer(this.server) });
  }

  public hasPasswordForServer(server: Server) {
    return this.credentials.find((c) => c.server.id === server?.id)?.password !== undefined;
  }

  public hasPasswordForUrl(serverUrl: string) {
    return this.credentials.find((c) => c.server.url === serverUrl)?.password !== undefined;
  }

  public async verifyCredentials(credentials: BasicServerCredentials, abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.post(`/api/credentials/authorize`, JSON.stringify(credentials.server), abortSignal, [credentials]);
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

  private static getLocallyStoredServerUsernames(): BasicServerCredentials[] {
    let locallyStoredServerUsernames: BasicServerCredentials[];
    if (typeof window !== "undefined") {
      locallyStoredServerUsernames = JSON.parse(localStorage.getItem("serverCredentials"));
    }
    return locallyStoredServerUsernames ?? [];
  }

  private updateLocallyStoredServerUsernames() {
    const credentialsWithoutPasswords = this.credentials.map((c) => {
      return {
        server: c.server,
        username: c.username
      };
    });
    localStorage.setItem("serverCredentials", JSON.stringify(credentialsWithoutPasswords));
  }

  public get onCredentialStateChanged() {
    return this._onCredentialStateChanged.asEvent();
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export default CredentialsService.Instance;
