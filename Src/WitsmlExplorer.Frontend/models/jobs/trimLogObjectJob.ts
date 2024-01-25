import ObjectReference from "models/jobs/objectReference";
import LogObject from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";

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
