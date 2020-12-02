import TrajectoryReference from "./trajectoryReference";
import WellboreReference from "./wellboreReference";

export default interface CopyTrajectoryJob {
  source: TrajectoryReference;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: TrajectoryReference) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "trajectoryUid"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToTrajectoryReference(input: string): TrajectoryReference {
  let jsonObject: TrajectoryReference;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
