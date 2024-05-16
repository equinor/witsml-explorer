import LogObject from "models/logObject";

export const getNameOccurrenceSuffix = (
  logObjects: LogObject[],
  logObject: LogObject
): string => {
  const filteredObjects = logObjects
    .filter((obj) => obj.name === logObject.name && !obj.runNumber)
    .sort((a, b) => a.uid.localeCompare(b.uid));

  if (filteredObjects.length > 1) {
    const index = filteredObjects.findIndex((obj) => obj.uid === logObject.uid);
    return ` [${String.fromCharCode(97 + index)}]`;
  }
  return "";
};
