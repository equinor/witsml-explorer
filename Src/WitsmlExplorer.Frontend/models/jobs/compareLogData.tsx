import ObjectReference from "models/jobs/objectReference";

export default interface CompareLogDataJob {
  sourceLog: ObjectReference;
  targetLog: ObjectReference;
  includeIndexDuplicates: boolean;
  compareAllIndexes: boolean;
}
