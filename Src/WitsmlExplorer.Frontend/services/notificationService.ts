import * as signalR from "@microsoft/signalr";
import { HubConnection } from "@microsoft/signalr";
import { AlertSeverity } from "components/Alerts";
import { msalEnabled } from "msal/MsalAuthProvider";
import { ApiClient, getBaseUrl } from "services/apiClient";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import ObjectOnWellbore from "../models/objectOnWellbore";

export interface Notification {
  serverUrl: URL;
  sourceServerUrl?: URL;
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
  objects?: ObjectOnWellbore[];
}

export enum RefreshType {
  Add = "Add",
  Update = "Update",
  Remove = "Remove",
  BatchUpdate = "BatchUpdate"
}

export type JobProgress = Record<string, number>;

export default class NotificationService {
  private static _instance: NotificationService;
  private hubConnection: HubConnection;
  private _snackbarDispatcher = new SimpleEventDispatcher<Notification>();
  private _alertDispatcher = new SimpleEventDispatcher<Notification>();
  private _refreshDispatcher = new SimpleEventDispatcher<RefreshAction>();
  private _onConnectionStateChanged = new SimpleEventDispatcher<boolean>();
  private _jobProgressDispatcher = new SimpleEventDispatcher<JobProgress>();
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
    this.setupConnection();
  }

  private async setupConnection() {
    let notificationURL = (await getBaseUrl()).toString();
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

    this.hubConnection?.on("jobProgress", (jobProgress: JobProgress) => {
      this._jobProgressDispatcher.dispatch(jobProgress);
    });

    this._jobProgressDispatcher.onSubscriptionChange.subscribe(
      (subscriptionCount) => {
        if (subscriptionCount === 1) {
          this.joinJobProgressGroup();
        } else if (subscriptionCount === 0) {
          this.leaveJobProgressGroup();
        }
      }
    );

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

  public get jobProgressDispatcher(): ISimpleEvent<JobProgress> {
    return this._jobProgressDispatcher.asEvent();
  }

  public get onConnectionStateChanged(): ISimpleEvent<boolean> {
    return this._onConnectionStateChanged.asEvent();
  }

  public static get Instance(): NotificationService {
    return this._instance || (this._instance = new this());
  }

  private async joinJobProgressGroup(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.send("JoinJobProgressGroup");
    }
  }

  private async leaveJobProgressGroup(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.send("LeaveJobProgressGroup");
    }
  }
}
