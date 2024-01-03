import LogObject from "../logObject";
import { toObjectReference } from "../objectOnWellbore";
import ObjectReference from "./objectReference";

export default interface TrimLogObjectJob {
  logObject: ObjectReference;
  startIndex?: string;
  endIndex?: string;
}

export function createTrimLogObjectJob(
  log: LogObject,
  startIndex?: string | number,
  endIndex?: string | number
): TrimLogObjectJob {
  const logObject: ObjectReference = toObjectReference(log);

  const formatIndexValue = (value?: string | number): string => {
    if (value) {
      if (typeof value === "number") return String(value);
      return value;
    }
  };

  return {
    logObject,
    startIndex: formatIndexValue(startIndex),
    endIndex: formatIndexValue(endIndex)
  };
}
