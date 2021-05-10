import ApiClient from "./apiClient";
import LogObject, { emptyLogObject } from "../models/logObject";
import LogCurveInfo from "../models/logCurveInfo";
import { LogData } from "../models/logData";

export default class LogObjectService {
  private static readonly MaximumPathLength = 2000;

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

  public static async getLogCurveInfo(wellUid: string, wellboreUid: string, logUid: string, abortSignal?: AbortSignal): Promise<LogCurveInfo[]> {
    const response = await ApiClient.get(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logcurveinfo`, abortSignal);
    if (response.ok) {
      return response.json();
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
    let params = mnemonics.map((mnemonic) => `mnemonic=${mnemonic}`);
    params = [...params, `startIndex=${encodeURIComponent(startIndex)}`, `endIndex=${encodeURIComponent(endIndex)}`, `startIndexIsInclusive=${startIndexIsInclusive}`];
    const postParams = [`startIndex=${encodeURIComponent(startIndex)}`, `endIndex=${encodeURIComponent(endIndex)}`, `startIndexIsInclusive=${startIndexIsInclusive}`];
    const pathName = `/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logdata?${params.join("&")}`;
    let response: Response;
    if (pathName.length < this.MaximumPathLength) {
      response = await ApiClient.get(pathName, abortSignal);
    } else {
      response = await ApiClient.post(`/api/wells/${wellUid}/wellbores/${wellboreUid}/logs/${logUid}/logdata?${postParams.join("&")}`, JSON.stringify(mnemonics), abortSignal);
    }
    if (response.ok) {
      return response.json();
    } else {
      return;
    }
  }
}
