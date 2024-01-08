import ObjectReferences from "models/jobs/objectReferences";

export default interface SpliceLogsJob {
  logs: ObjectReferences;
  newLogName: string;
  newLogUid: string;
}
