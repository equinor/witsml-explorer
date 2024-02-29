import LogObject from "models/logObject";

export default interface DownloadAllLogDataJob {
  logReference: LogObject;
  mnemonics: string[];
  startIndexIsInclusive: boolean;
}
