import LogObject from "../logObject";

export default interface CompareLogDataJob {
  logReference: LogObject;
  selectedLog: LogObject;
  targetLog: LogObject;
}
