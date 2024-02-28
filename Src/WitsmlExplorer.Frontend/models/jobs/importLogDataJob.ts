import ObjectReference from "models/jobs/objectReference";

export default interface ImportLogDataJob {
  targetLog: ObjectReference;
  mnemonics: string[];
  units: string[];
  dataRows: string[][];
}
