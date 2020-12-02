import LogReference from "./logReference";

export default interface DeleteMnemonicsJob {
  logObject: LogReference;
  mnemonics: string[];
}
