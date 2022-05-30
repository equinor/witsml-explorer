import TubularReference from "./tubularReference";
import WellboreReference from "./wellboreReference";

export default interface CopyTubularJob {
  source: TubularReference;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: TubularReference) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "tubularUid"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToTubularReference(input: string): TubularReference {
  let jsonObject: TubularReference;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
