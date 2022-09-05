import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { parseStringToTrajectoryStationReferences, TrajectoryStationReferences } from "../../models/jobs/copyTrajectoryStationJob";
import TrajectoryReference from "../../models/jobs/trajectoryReference";
import Trajectory from "../../models/trajectory";
import JobService, { JobType } from "../../services/jobService";

type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardTrajectoryStationReferences: () => [TrajectoryStationReferences | null, Dispatch<SetStateAction<TrajectoryStationReferences>>] = () => {
  const [trajectoryStationReferences, setTrajectoryStationReferences] = useState<TrajectoryStationReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const trajectoryStationReferences = parseStringToTrajectoryStationReferences(clipboardText);
        setTrajectoryStationReferences(trajectoryStationReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [trajectoryStationReferences, setTrajectoryStationReferences];
};

export const orderCopyJob = (trajectory: Trajectory, trajectoryStationReferences: TrajectoryStationReferences, dispatchOperation: DispatchOperation) => {
  const trajectoryReference: TrajectoryReference = {
    wellUid: trajectory.wellUid,
    wellboreUid: trajectory.wellboreUid,
    trajectoryUid: trajectory.uid
  };

  const copyJob = { source: trajectoryStationReferences, target: trajectoryReference };
  JobService.orderJob(JobType.CopyTrajectoryStations, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};
