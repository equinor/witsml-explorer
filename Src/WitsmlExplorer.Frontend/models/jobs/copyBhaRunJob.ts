import BhaRunReferences from "./bhaRunReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyBhaRunJob {
  source: BhaRunReferences;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: BhaRunReferences) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "bhaRunUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToBhaRunReferences(input: string): BhaRunReferences {
  let jsonObject: BhaRunReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
