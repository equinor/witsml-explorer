import { Moment } from "moment";
import LogObject from "../logObject";
import { toObjectReference } from "../objectOnWellbore";
import ObjectReference from "./objectReference";

export default interface TrimLogObjectJob {
  logObject: ObjectReference;
  startIndex?: string;
  endIndex?: string;
}

export function createTrimLogObjectJob(log: LogObject, startIndex?: Moment | number, endIndex?: Moment | number): TrimLogObjectJob {
  const logObject: ObjectReference = toObjectReference(log);

  const formatIndexValue = (value?: Moment | number): string => {
    if (value) {
      if (typeof value === "number") return String(value);
      return (value as Moment).toDate().toISOString();
    }
  };

  return {
    logObject,
    startIndex: formatIndexValue(startIndex),
    endIndex: formatIndexValue(endIndex)
  };
}
