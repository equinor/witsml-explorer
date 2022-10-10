import { TrajectoryStationRow } from "../../components/ContentViews/TrajectoryView";
import { toObjectReference } from "../objectOnWellbore";
import Trajectory from "../trajectory";
import ObjectReference from "./objectReference";

export interface CopyTrajectoryStationJob {
  source: TrajectoryStationReferences;
  target: ObjectReference;
}

export interface TrajectoryStationReferences {
  serverUrl: string;
  trajectoryReference: ObjectReference;
  trajectoryStationUids: string[];
}

export function parseStringToTrajectoryStationReferences(input: string): TrajectoryStationReferences {
  let jsonObject: TrajectoryStationReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);

  return {
    serverUrl: jsonObject.serverUrl,
    trajectoryReference: jsonObject.trajectoryReference,
    trajectoryStationUids: jsonObject.trajectoryStationUids
  };
}

function verifyRequiredProperties(jsonObject: TrajectoryStationReferences) {
  const requiredProps = ["serverUrl", "trajectoryReference", "trajectoryStationUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function createTrajectoryStationReferences(trajectoryStations: TrajectoryStationRow[], source: Trajectory, serverUrl: string): TrajectoryStationReferences {
  return {
    serverUrl: serverUrl,
    trajectoryReference: toObjectReference(source),
    trajectoryStationUids: trajectoryStations.map((component) => component.uid)
  };
}

export function createCopyTrajectoryStationJob(sourceTrajectoryStationReferences: TrajectoryStationReferences, target: Trajectory): CopyTrajectoryStationJob {
  return {
    source: sourceTrajectoryStationReferences,
    target: toObjectReference(target)
  };
}
