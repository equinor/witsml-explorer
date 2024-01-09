import { ErrorDetails } from "models/errorDetails";
import { LogData } from "models/logData";
import { ApiClient } from "services/apiClient";
import AuthorizationService from "services/authorizationService";
import NotificationService from "services/notificationService";

export default class LogObjectService {
  public static async getLogData(
    wellUid: string,
    wellboreUid: string,
    logUid: string,
    mnemonics: string[],
    startIndexIsInclusive: boolean,
    startIndex: string,
    endIndex: string,
    abortSignal: AbortSignal
  ): Promise<LogData> {
    if (mnemonics.length === 0) return;
    const params = [
      `startIndex=${encodeURIComponent(startIndex)}`,
      `endIndex=${encodeURIComponent(endIndex)}`,
      `startIndexIsInclusive=${startIndexIsInclusive}`
    ];
    const pathName = `/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logdata?${params.join(
      "&"
    )}`;
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
}
