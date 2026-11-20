import ObjectReference from "models/jobs/objectReference";

export default interface ImportLasFileJob {
  targetLog: ObjectReference;
  uploadId: string;
  mnemonics: string[];
  dateTimeFormat: string;
}
