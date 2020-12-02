import { Server } from "../models/server";
import { SimpleEventDispatcher } from "ste-simple-events";
import ApiClient, { AuthConfig } from "./apiClient";
import { ErrorDetails } from "../models/errorDetails";

export interface ServerCredentials {
  server: Server;
  username: string;
  password: string;
}

class CredentialsService {
  private static _instance: CredentialsService;
  private _onCredentialStateChanged = new SimpleEventDispatcher<{ server: Server; hasPassword: boolean }>();
  private credentials: ServerCredentials[];
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

  public saveCredentials(serverCredentials: ServerCredentials) {
    const index = this.credentials.findIndex((c) => c.server.id === serverCredentials.server.id);
    if (index === -1) {
      this.credentials.push(serverCredentials);
    } else {
      this.credentials[index] = serverCredentials;
    }
    this.updateLocallyStoredServerUsernames();
    this._onCredentialStateChanged.dispatch({ server: serverCredentials.server, hasPassword: Boolean(serverCredentials.password) });
  }

  public getCredentials(): ServerCredentials[] {
    const currentCredentials = this.credentials.find((c) => c.server.id === this.server?.id);
    const sourceCredentials = this.getSourceServerCredentials();
    return [...(currentCredentials ? [currentCredentials] : []), ...(sourceCredentials ? [sourceCredentials] : [])];
  }

  public getSourceServerCredentials(): ServerCredentials | undefined {
    return this.credentials.find((c) => c.server.id === this.sourceServer?.id);
  }

  public clearPasswords() {
    this.credentials = CredentialsService.getLocallyStoredServerUsernames();
    this._onCredentialStateChanged.dispatch({ server: this.server, hasPassword: this.hasPasswordForServer(this.server) });
  }

  public hasPasswordForServer(server: Server) {
    return this.credentials.find((c) => c.server.id === server.id)?.password !== undefined;
  }

  public async verifyCredentials(credentials: ServerCredentials, abortSignal?: AbortSignal): Promise<any> {
    const response = await ApiClient.post(`/api/credentials/authorize`, JSON.stringify(credentials.server), abortSignal, AuthConfig.WITSML_AUTHENTICATION_REQUIRED, [credentials]);
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

  private static getLocallyStoredServerUsernames(): ServerCredentials[] {
    let locallyStoredServerUsernames: ServerCredentials[];
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
