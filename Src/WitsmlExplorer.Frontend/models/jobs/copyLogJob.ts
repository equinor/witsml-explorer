import LogReference from "./logReference";
import WellboreReference from "./wellboreReference";

export default interface CopyLogJob {
  source: LogReference;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: LogReference) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "logUid"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToLogReference(input: string): LogReference {
  let jsonObject: LogReference;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
