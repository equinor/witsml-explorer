import * as signalR from "@microsoft/signalr";
import { HubConnection } from "@microsoft/signalr";
import { AlertSeverity } from "components/Alerts";
import { msalEnabled } from "msal/MsalAuthProvider";
import { ApiClient, getBaseUrl } from "services/apiClient";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";

export interface Notification {
  serverUrl: URL;
  isSuccess: boolean;
  message: string;
  severity?: AlertSeverity;
  reason?: string;
  description?: ObjectDescription;
  jobId?: string;
}

interface ObjectDescription {
  wellName: string;
  wellboreName: string;
  objectName: string;
}

export interface RefreshAction {
  entityType: string;
  refreshType?: RefreshType;
  serverUrl: URL;
  wellUid?: string;
  wellUids?: string[];
  wellboreUid?: string;
  objectUid?: string;
}

export enum RefreshType {
  Add = "Add",
  Update = "Update",
  Remove = "Remove"
}

export default class NotificationService {
  private static _instance: NotificationService;
  private hubConnection: HubConnection;
  private _snackbarDispatcher = new SimpleEventDispatcher<Notification>();
  private _alertDispatcher = new SimpleEventDispatcher<Notification>();
  private _refreshDispatcher = new SimpleEventDispatcher<RefreshAction>();
  private _onConnectionStateChanged = new SimpleEventDispatcher<boolean>();
  private static token: string | null = null;

  private static async getToken(): Promise<string> {
    if (this.token != null) {
      return this.token;
    }
    const response = await ApiClient.get(`/api/credentials/token`);
    if (response.ok) {
      this.token = await response.text();
      return this.token;
    }
  }

  private constructor() {
    let notificationURL = getBaseUrl().toString();
    if (!notificationURL.endsWith("/")) {
      notificationURL = notificationURL + "/";
    }
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${notificationURL}notifications`, {
        accessTokenFactory: msalEnabled
          ? () => NotificationService.getToken()
          : undefined
      })
      ?.withAutomaticReconnect([3000, 5000, 10000])
      ?.configureLogging(signalR.LogLevel.None)
      ?.build();

    this.hubConnection?.on("jobFinished", (notification: Notification) => {
      notification.isSuccess
        ? this._snackbarDispatcher.dispatch(notification)
        : this._alertDispatcher.dispatch(notification);
    });

    this.hubConnection?.on("refresh", (refreshAction: RefreshAction) => {
      this._refreshDispatcher.dispatch(refreshAction);
    });

    this.hubConnection?.onreconnecting(() => {
      this._onConnectionStateChanged.dispatch(false);
    });
    this.hubConnection?.onreconnected(() => {
      this._onConnectionStateChanged.dispatch(true);
    });
    this.hubConnection?.onclose(() => {
      NotificationService.token = null;
      setTimeout(() => this.hubConnection.start(), 5000);
    });

    this.hubConnection?.start();
  }

  public get snackbarDispatcher(): SimpleEventDispatcher<Notification> {
    return this._snackbarDispatcher;
  }

  public get alertDispatcher(): SimpleEventDispatcher<Notification> {
    return this._alertDispatcher;
  }

  public get snackbarDispatcherAsEvent(): ISimpleEvent<Notification> {
    return this._snackbarDispatcher.asEvent();
  }

  public get alertDispatcherAsEvent(): ISimpleEvent<Notification> {
    return this._alertDispatcher.asEvent();
  }

  public get refreshDispatcher(): ISimpleEvent<RefreshAction> {
    return this._refreshDispatcher.asEvent();
  }

  public get onConnectionStateChanged(): ISimpleEvent<boolean> {
    return this._onConnectionStateChanged.asEvent();
  }

  public static get Instance(): NotificationService {
    return this._instance || (this._instance = new this());
  }
}
