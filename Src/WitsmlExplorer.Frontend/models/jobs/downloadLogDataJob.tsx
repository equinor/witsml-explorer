import LogObject from "models/logObject";

export default interface DownloadLogDataJob {
  logReference: LogObject;
  mnemonics: string[];
  startIndexIsInclusive: boolean;
  exportToLas: boolean;
  startIndex?: string;
  endIndex?: string;
}
