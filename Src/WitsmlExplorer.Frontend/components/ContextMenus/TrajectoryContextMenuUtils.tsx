import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OperationType from "../../contexts/operationType";
import { parseStringToTrajectoryReferences } from "../../models/jobs/copyTrajectoryJob";
import { DeleteTrajectoriesJob } from "../../models/jobs/deleteJobs";
import TrajectoryReferences from "../../models/jobs/trajectoryReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import ConfirmModal from "../Modals/ConfirmModal";
import { DispatchOperation } from "./ContextMenuUtils";

export const useClipboardTrajectoryReferences: () => [TrajectoryReferences | null, Dispatch<SetStateAction<TrajectoryReferences>>] = () => {
  const [trajectoryReferences, setTrajectoryReferences] = useState<TrajectoryReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const trajectoryReferences = parseStringToTrajectoryReferences(clipboardText);
        setTrajectoryReferences(trajectoryReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [trajectoryReferences, setTrajectoryReferences];
};

export const orderCopyJob = (wellbore: Wellbore, trajectoryReferences: TrajectoryReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: trajectoryReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyTrajectory, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const deleteTrajectory = async (trajectories: Trajectory[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteTrajectoriesJob = {
    toDelete: {
      trajectoryUids: trajectories.map((trajectory) => trajectory.uid),
      wellUid: trajectories[0].wellUid,
      wellboreUid: trajectories[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteTrajectories, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, trajectories: Trajectory[], dispatchOperation: DispatchOperation) => {
  const trajectoryReferences: TrajectoryReferences = {
    serverUrl: selectedServer.url,
    trajectoryUids: trajectories.map((trajectory) => trajectory.uid),
    wellUid: trajectories[0].wellUid,
    wellboreUid: trajectories[0].wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(trajectoryReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDelete = async (trajectories: Trajectory[], dispatchOperation: DispatchOperation) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete trajectory?"}
      content={
        <span>
          This will permanently delete trajectories: <strong>{trajectories.map((item) => item.uid).join(", ")}</strong>
        </span>
      }
      onConfirm={() => deleteTrajectory(trajectories, dispatchOperation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
