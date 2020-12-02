import React from "react";
import ContextMenu from "./ContextMenu";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import Trajectory from "../../models/trajectory";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import TrajectoryService from "../../services/trajectoryService";
import { CopyIcon, DeleteIcon } from "../Icons";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreTrajectoryAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import TrajectoryReference from "../../models/jobs/trajectoryReference";
import { Server } from "../../models/server";

export interface TrajectoryContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTrajectoryAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
}

const TrajectoryContextMenu = (props: TrajectoryContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, trajectory, selectedServer } = props;

  const deleteTrajectory = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      trajectoryReference: {
        wellUid: trajectory.wellUid,
        wellboreUid: trajectory.wellboreUid,
        trajectoryUid: trajectory.uid
      }
    };
    await JobService.orderJob(JobType.DeleteTrajectory, job);
    const freshTrajectories = await TrajectoryService.getTrajectories(job.trajectoryReference.wellUid, job.trajectoryReference.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateTrajectoryOnWellbore,
      payload: {
        wellUid: job.trajectoryReference.wellUid,
        wellboreUid: job.trajectoryReference.wellboreUid,
        trajectories: freshTrajectories
      }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCopy = async () => {
    const trajectoryReference: TrajectoryReference = {
      serverUrl: selectedServer.url,
      trajectoryUid: trajectory.uid,
      wellUid: trajectory.wellUid,
      wellboreUid: trajectory.wellboreUid
    };
    await navigator.clipboard.writeText(JSON.stringify(trajectoryReference));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete trajectory?"}
        content={
          <span>
            This will permanently delete <strong>{trajectory.name}</strong>
          </span>
        }
        onConfirm={deleteTrajectory}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={onClickCopy}>
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Copy</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoryContextMenu;
