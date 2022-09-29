import LogCurveInfo from "../models/logCurveInfo";
import { LogData } from "../models/logData";
import LogObject, { emptyLogObject } from "../models/logObject";
import { ApiClient } from "./apiClient";
import { BasicServerCredentials } from "./credentialsService";

export default class LogObjectService {
  public static async getLogs(wellUid: string, wellboreUid: string, abortSignal?: AbortSignal): Promise<LogObject[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getLog(wellUid: string, wellboreUid: string, logUid: string, abortSignal?: AbortSignal): Promise<LogObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return emptyLogObject();
    }
  }

  public static async getLogFromServer(wellUid: string, wellboreUid: string, logUid: string, credentials: BasicServerCredentials, abortSignal?: AbortSignal): Promise<LogObject> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}`, abortSignal, [credentials]);
    if (response.ok) {
      // the route returns null if the log was not found so we need to check for it
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      } else {
        return emptyLogObject();
      }
    } else {
      return emptyLogObject();
    }
  }

  public static async getLogCurveInfo(wellUid: string, wellboreUid: string, logUid: string, abortSignal?: AbortSignal): Promise<LogCurveInfo[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logcurveinfo`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return [];
    }
  }

  public static async getLogCurveInfoFromServer(
    wellUid: string,
    wellboreUid: string,
    logUid: string,
    credentials: BasicServerCredentials,
    abortSignal?: AbortSignal
  ): Promise<LogCurveInfo[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logcurveinfo`, abortSignal, [credentials]);
    if (response.ok) {
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

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
    const params = [`startIndex=${encodeURIComponent(startIndex)}`, `endIndex=${encodeURIComponent(endIndex)}`, `startIndexIsInclusive=${startIndexIsInclusive}`];
    const pathName = `api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logdata?${params.join("&")}`;
    const response = await ApiClient.post(pathName, JSON.stringify(mnemonics), abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return;
    }
  }
}
