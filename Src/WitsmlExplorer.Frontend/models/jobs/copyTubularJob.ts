import TubularsReference from "./tubularsReference";
import WellboreReference from "./wellboreReference";

export default interface CopyTubularJob {
  source: TubularsReference;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: TubularsReference) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "tubularUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToTubularsReference(input: string): TubularsReference {
  let jsonObject: TubularsReference;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
