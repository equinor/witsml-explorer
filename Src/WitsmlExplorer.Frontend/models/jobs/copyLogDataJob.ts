import { LogCurveInfoRow } from "../../components/ContentViews/LogCurveInfoListView";
import LogObject from "../logObject";
import LogReference from "./logReference";

export interface CopyLogDataJob {
  source: LogCurvesReference;
  target: LogReference;
}

export interface LogCurvesReference {
  serverUrl: string;
  logReference: LogReference;
  mnemonics: string[];
}

export function parseStringToLogCurvesReference(input: string): LogCurvesReference {
  let jsonObject: LogCurvesReference;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);

  return {
    serverUrl: jsonObject.serverUrl,
    logReference: jsonObject.logReference,
    mnemonics: jsonObject.mnemonics
  };
}

function verifyRequiredProperties(jsonObject: LogCurvesReference) {
  const requiredProps = ["serverUrl", "logReference", "mnemonics"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function createLogCurvesReference(logCurveInfoRows: LogCurveInfoRow[], source: LogObject, serverUrl: string): LogCurvesReference {
  return {
    serverUrl: serverUrl,
    logReference: {
      wellUid: source.wellUid,
      wellboreUid: source.wellboreUid,
      logUid: source.uid
    },
    mnemonics: logCurveInfoRows.map((dataRow) => dataRow.mnemonic)
  };
}

export function createCopyLogDataJob(sourceLogCurvesReference: LogCurvesReference, target: LogObject): CopyLogDataJob {
  return {
    source: sourceLogCurvesReference,
    target: {
      wellUid: target.wellUid,
      wellboreUid: target.wellboreUid,
      logUid: target.uid
    }
  };
}
