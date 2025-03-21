import LogObject from "../logObject.tsx";

export interface MinimumDataQcJob {
  logReference: LogObject;
  startIndex: string;
  endIndex: string;
  mnemonics: string[];
  density: number;
  depthGap?: number;
  timeGap?: number;
}
