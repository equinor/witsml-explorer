import LogObject from "models/logObject";

export default interface DownloadLogDataJob {
  logReference: LogObject;
  mnemonics: string[];
  startIndexIsInclusive: boolean;
  startIndex?: string;
  endIndex?: string;
}
