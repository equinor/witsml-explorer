import { ErrorDetails } from "models/errorDetails";
import { ApiClient } from "services/apiClient";
import AuthorizationService from "services/authorizationService";
import NotificationService from "services/notificationService";
import LogCurveInfo from "../models/logCurveInfo";
import { LogData } from "../models/logData";

export default class LogObjectService {
  public static async getLogData(
    wellUid: string,
    wellboreUid: string,
    logUid: string,
    mnemonics: string[],
    startIndexIsInclusive: boolean,
    startIndex: string,
    endIndex: string,
    loadAllData: boolean,
    abortSignal: AbortSignal
  ): Promise<LogData> {
    if (mnemonics.length === 0) return;
    const params = [
      `startIndexIsInclusive=${startIndexIsInclusive}`,
      `loadAllData=${loadAllData}`
    ];
    if (startIndex) params.push(`startIndex=${encodeURIComponent(startIndex)}`);
    if (endIndex) params.push(`endIndex=${encodeURIComponent(endIndex)}`);
    const pathName = `/api/wells/${encodeURIComponent(
      wellUid
    )}/wellbores/${encodeURIComponent(wellboreUid)}/logs/${encodeURIComponent(
      logUid
    )}/logdata?${params.join("&")}`;
    const response = await ApiClient.post(
      pathName,
      JSON.stringify(mnemonics),
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

  public static async getMultiLogData(
    wellUid: string,
    wellboreUid: string,
    logMnemonics: Record<string, string[]>,
    startIndexIsInclusive: boolean,
    startIndex: string,
    endIndex: string,
    abortSignal: AbortSignal
  ): Promise<LogData> {
    if (Object.entries(logMnemonics).length === 0) return;
    const params = [`startIndexIsInclusive=${startIndexIsInclusive}`];
    if (startIndex) params.push(`startIndex=${encodeURIComponent(startIndex)}`);
    if (endIndex) params.push(`endIndex=${encodeURIComponent(endIndex)}`);
    const pathName = `/api/wells/${encodeURIComponent(
      wellUid
    )}/wellbores/${encodeURIComponent(
      wellboreUid
    )}/multilog/logdata?${params.join("&")}`;
    const response = await ApiClient.post(
      pathName,
      JSON.stringify(logMnemonics),
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

  public static async getMultiLogsCurveInfo(
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
