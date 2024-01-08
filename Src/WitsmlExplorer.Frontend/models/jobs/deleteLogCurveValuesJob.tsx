import ObjectReference from "models/jobs/objectReference";

export interface IndexRange {
  startIndex: string;
  endIndex: string;
}

export interface DeleteLogCurveValuesJob {
  logReference: ObjectReference;
  mnemonics: string[];
  indexRanges: IndexRange[];
}
