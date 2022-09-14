import OperationType from "../../contexts/operationType";
import { DeleteTrajectoriesJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import JobService, { JobType } from "../../services/jobService";
import ConfirmModal from "../Modals/ConfirmModal";
import { DispatchOperation } from "./ContextMenuUtils";

export const deleteTrajectory = async (trajectories: Trajectory[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteTrajectoriesJob = {
    toDelete: {
      objectUids: trajectories.map((trajectory) => trajectory.uid),
      wellUid: trajectories[0].wellUid,
      wellboreUid: trajectories[0].wellboreUid,
      objectType: ObjectType.Trajectory
    }
  };
  await JobService.orderJob(JobType.DeleteTrajectories, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, trajectories: Trajectory[], dispatchOperation: DispatchOperation) => {
  const trajectoryReferences: ObjectReferences = {
    serverUrl: selectedServer.url,
    objectUids: trajectories.map((trajectory) => trajectory.uid),
    wellUid: trajectories[0].wellUid,
    wellboreUid: trajectories[0].wellboreUid,
    objectType: ObjectType.Trajectory
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
