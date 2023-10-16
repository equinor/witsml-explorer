import ObjectReferences from "./objectReferences";

export default interface SpliceLogsJob {
  logs: ObjectReferences;
  newLogName: string;
  newLogUid: string;
}
