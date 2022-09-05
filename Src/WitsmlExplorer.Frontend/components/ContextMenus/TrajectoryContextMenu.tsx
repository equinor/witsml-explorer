import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreTrajectoriesAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteTrajectoryJob } from "../../models/jobs/deleteJobs";
import TrajectoryReference from "../../models/jobs/trajectoryReference";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import JobService, { JobType } from "../../services/jobService";
import TrajectoryService from "../../services/trajectoryService";
import { colors } from "../../styles/Colors";
import ConfirmModal from "../Modals/ConfirmModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import { orderCopyJob, useClipboardTrajectoryStationReferences } from "./TrajectoryStationContextMenuUtils";

export interface TrajectoryContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTrajectoriesAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectoryContextMenu = (props: TrajectoryContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, trajectory, selectedServer, servers } = props;
  const [trajectoryStationReferences] = useClipboardTrajectoryStationReferences();

  const deleteTrajectory = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteTrajectoryJob = {
      toDelete: {
        wellUid: trajectory.wellUid,
        wellboreUid: trajectory.wellboreUid,
        trajectoryUid: trajectory.uid
      }
    };
    await JobService.orderJob(JobType.DeleteTrajectory, job);
    const freshTrajectories = await TrajectoryService.getTrajectories(job.toDelete.wellUid, job.toDelete.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateTrajectoriesOnWellbore,
      payload: {
        wellUid: job.toDelete.wellUid,
        wellboreUid: job.toDelete.wellboreUid,
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

  const serverUrl = trajectoryStationReferences?.serverUrl;
  const orderCopy = () => orderCopyJob(trajectory, trajectoryStationReferences, dispatchOperation);
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={onClickCopy}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, serverUrl, dispatchOperation, orderCopy)} disabled={trajectoryStationReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory station", trajectoryStationReferences?.trajectoryStationUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoryContextMenu;
