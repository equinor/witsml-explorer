import TrajectoryReference from "./trajectoryReference";
import TrajectoryReferences from "./trajectoryReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyTrajectoryJob {
  source: TrajectoryReference;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: TrajectoryReferences) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "trajectoryUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToTrajectoryReferences(input: string): TrajectoryReferences {
  let jsonObject: TrajectoryReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
