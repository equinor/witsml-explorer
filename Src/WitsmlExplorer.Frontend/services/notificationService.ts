import * as signalR from "@microsoft/signalr";
import { HubConnection } from "@microsoft/signalr";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { ApiClient, getBaseUrl } from "./apiClient";

export interface Notification {
  serverUrl: URL;
  isSuccess: boolean;
  message: string;
  reason?: string;
  description?: ObjectDescription;
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
  wellUid: string;
  wellboreUid?: string;
  logObjectUid?: string;
  messageObjectUid?: string;
  trajectoryUid?: string;
  wbGeometryUid?: string;
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

  private static async getToken(): Promise<any> {
    console.log("getToken");
    const response = await ApiClient.get(`/api/credentials/token`);
    if (response.ok) {
      return response.text();
    }
  }

  private constructor() {
    let notificationURL = getBaseUrl().toString();
    if (!notificationURL.endsWith("/")) {
      notificationURL = notificationURL + "/";
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${notificationURL}notifications`, {
        accessTokenFactory: () => NotificationService.getToken()
      })
      .withAutomaticReconnect([3000, 5000, 10000])
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.hubConnection.on("jobFinished", (notification: Notification) => {
      notification.isSuccess ? this._snackbarDispatcher.dispatch(notification) : this._alertDispatcher.dispatch(notification);
    });

    this.hubConnection.on("refresh", (refreshAction: RefreshAction) => {
      this._refreshDispatcher.dispatch(refreshAction);
    });

    this.hubConnection.onreconnecting(() => {
      this._onConnectionStateChanged.dispatch(false);
    });
    this.hubConnection.onreconnected(() => {
      this._onConnectionStateChanged.dispatch(true);
    });
    this.hubConnection.onclose(() => {
      setTimeout(() => this.hubConnection.start(), 5000);
    });

    this.hubConnection.start();
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
