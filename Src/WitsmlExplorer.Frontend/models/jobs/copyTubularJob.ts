import TubularReferences from "./tubularReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyTubularJob {
  source: TubularReferences;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: TubularReferences) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "tubularUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToTubularReferences(input: string): TubularReferences {
  let jsonObject: TubularReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
