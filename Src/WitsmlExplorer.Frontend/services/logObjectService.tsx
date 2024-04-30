import { ErrorDetails } from "models/errorDetails";
import { LogData, LogDataRequestQuery } from "../models/logData";
import { ApiClient } from "services/apiClient";
import AuthorizationService from "services/authorizationService";
import NotificationService from "services/notificationService";
import LogCurveInfo from "../models/logCurveInfo";

export default class LogObjectService {
  public static async getLogData(
    wellUid: string,
    wellboreUid: string,
    requestData: LogDataRequestQuery[],
    startIndexIsInclusive: boolean,
    startIndex: string,
    endIndex: string,
    loadAllData: boolean,
    abortSignal: AbortSignal
  ): Promise<LogData> {
    if (requestData.length === 0) return;
    const params = [
      `startIndex=${encodeURIComponent(startIndex)}`,
      `endIndex=${encodeURIComponent(endIndex)}`,
      `startIndexIsInclusive=${startIndexIsInclusive}`,
      `loadAllData=${loadAllData}`
    ];
    const pathName = `/api/wells/${encodeURIComponent(
      wellUid
    )}/wellbores/${encodeURIComponent(wellboreUid)}/multilog/data?${params.join(
      "&"
    )}`;

    const response = await ApiClient.post(
      pathName,
      JSON.stringify(requestData),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      let errorMessage;
      switch (response.status) {
        case 500:
          errorMessage = message;
          break;
        default:
          errorMessage = `Something unexpected has happened.`;
      }
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: new URL(AuthorizationService.selectedServer.url),
        message: errorMessage,
        isSuccess: false
      });
      return;
    }
  }

  public static async getMnemonicsInLogs(
    wellUid: string,
    wellboreUid: string,
    logUids: string[],
    abortSignal: AbortSignal
  ): Promise<LogCurveInfo[]> {
    if (logUids.length === 0) return;
    const pathName = `/api/wells/${wellUid}/wellbores/${wellboreUid}/multilog/mnemonics`;

    const response = await ApiClient.post(
      pathName,
      JSON.stringify(logUids),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      let errorMessage;
      switch (response.status) {
        case 500:
          errorMessage = message;
          break;
        default:
          errorMessage = `Something unexpected has happened.`;
      }
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: new URL(AuthorizationService.selectedServer.url),
        message: errorMessage,
        isSuccess: false
      });
      return;
    }
  }
}
