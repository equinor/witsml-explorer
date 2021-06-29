import LogReference from "./logReference";

export default interface ImportLogDataJob {
  targetLog: LogReference;
  mnemonics: string[];
  units: string[];
  dataRows: string[][];
}
