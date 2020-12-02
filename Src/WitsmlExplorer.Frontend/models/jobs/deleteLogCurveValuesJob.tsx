import LogReference from "./logReference";

export interface IndexRange {
  startIndex: string;
  endIndex: string;
}

export interface DeleteLogCurveValuesJob {
  logReference: LogReference;
  mnemonics: string[];
  indexRanges: IndexRange[];
}
