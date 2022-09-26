import ObjectReference from "./objectReference";

export default interface ImportLogDataJob {
  targetLog: ObjectReference;
  mnemonics: string[];
  units: string[];
  dataRows: string[][];
}
