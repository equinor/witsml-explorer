import { Moment } from "moment";
import LogObject from "../logObject";
import LogReference from "./logReference";

export default interface TrimLogObjectJob {
  logObject: LogReference;
  startIndex?: string;
  endIndex?: string;
}

export function createTrimLogObjectJob(log: LogObject, startIndex?: Moment | number, endIndex?: Moment | number): TrimLogObjectJob {
  const logObject = {
    wellUid: log.wellUid,
    wellboreUid: log.wellboreUid,
    logUid: log.uid
  };

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
