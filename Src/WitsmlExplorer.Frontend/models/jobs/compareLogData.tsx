import ObjectReference from "./objectReference";

export default interface CompareLogDataJob {
  sourceLog: ObjectReference;
  targetLog: ObjectReference;
  includeIndexDuplicates: boolean;
}
