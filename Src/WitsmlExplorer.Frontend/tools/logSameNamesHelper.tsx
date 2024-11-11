import LogObject from "models/logObject";

export const getNameOccurrenceSuffix = (
  logObjects: LogObject[],
  logObject: LogObject
): string => {
  if (logObject.runNumber) {
    return ` (${logObject.runNumber})`;
  }

  const filteredObjects = logObjects
    .filter(
      (obj) =>
        obj.name === logObject.name &&
        obj.indexType === logObject.indexType &&
        !obj.runNumber
    )
    .sort((a, b) => a.uid.localeCompare(b.uid));

  if (filteredObjects.length > 1) {
    const index = filteredObjects.findIndex((obj) => obj.uid === logObject.uid);
    return ` [${String.fromCharCode(97 + index)}]`;
  }

  return "";
};
