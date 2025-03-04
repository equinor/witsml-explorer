import LogObject from "../logObject.tsx";

export interface MinimumDataQcJob {
  logReference: LogObject;
  mnemonics: string[];
  density: number;
  depthGap?: number;
  timeGap?: number;
}
