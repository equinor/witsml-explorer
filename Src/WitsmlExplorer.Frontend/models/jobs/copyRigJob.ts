import RigReferences from "./rigReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyRigJob {
  source: RigReferences;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: RigReferences) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "rigUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToRigReferences(input: string): RigReferences {
  let jsonObject: RigReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
