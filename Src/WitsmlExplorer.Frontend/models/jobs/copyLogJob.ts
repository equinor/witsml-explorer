import WellboreReference from "./wellboreReference";
import LogReferences from "./logReferences";

export default interface CopyLogJob {
  source: LogReferences;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: LogReferences) {
  const requiredProps = ["serverUrl", "logReferenceList"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToLogReference(input: string): LogReferences {
  let jsonObject: LogReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
