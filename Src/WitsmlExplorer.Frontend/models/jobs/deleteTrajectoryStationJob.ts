import TrajectoryReference from "./trajectoryReference";

export default interface DeleteTrajectoryStationJob {
  trajectory: TrajectoryReference;
  uids: string[];
}
