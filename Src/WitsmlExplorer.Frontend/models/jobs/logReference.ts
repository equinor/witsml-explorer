export default interface LogReference {
  serverUrl?: string;
  wellUid: string;
  wellboreUid: string;
  logUid: string;
  checkedLogUids?: string[];
}
