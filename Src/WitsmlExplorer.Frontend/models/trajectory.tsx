import TrajectoryStation from "./trajectoryStation";
import Wellbore from "./wellbore";

export default interface Trajectory {
  uid: string;
  wellUid: string;
  wellboreUid: string;
  name: string;
  mdMin: number;
  mdMax: number;
  aziRef: string;
  dTimTrajStart: Date;
  dTimTrajEnd: Date;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
  trajectoryStations: TrajectoryStation[];
}

export const calculateTrajectoryId = (trajectory: Trajectory): string => {
  return trajectory.wellUid + trajectory.wellboreUid + trajectory.uid;
};

export const getTrajectoryProperties = (trajectory: Trajectory, wellbore: Wellbore): Map<string, string> => {
  return new Map([
    ["Well", wellbore.wellName],
    ["UID Well", trajectory.wellUid],
    ["Wellbore", wellbore.name],
    ["UID Wellbore", trajectory.wellboreUid],
    ["Trajectory", trajectory.name]
  ]);
};
