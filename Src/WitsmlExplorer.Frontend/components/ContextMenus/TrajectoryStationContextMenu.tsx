import React from "react";
import ContextMenu from "./ContextMenu";
import { Divider, MenuItem } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import { colors } from "../../styles/Colors";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import Trajectory from "../../models/trajectory";
import TrajectoryStationPropertiesModal from "../Modals/TrajectoryStationPropertiesModal";
import { TrajectoryStationRow } from "../ContentViews/TrajectoryView";
import { UpdateWellboreTrajectoryAction } from "../../contexts/navigationStateReducer";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import DeleteTrajectoryStationJob from "../../models/jobs/deleteTrajectoryStationJob";
import { StyledIcon } from "./ContextMenuUtils";

export interface TrajectoryStationContextMenuProps {
  checkedTrajectoryStations: TrajectoryStationRow[];
  dispatchNavigation: (action: UpdateWellboreTrajectoryAction) => void;
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectoryStationContextMenu = (props: TrajectoryStationContextMenuProps): React.ReactElement => {
  const { checkedTrajectoryStations, dispatchOperation, trajectory } = props;

  const onClickProperties = async () => {
    const trajectoryStationPropertiesModalProps = { trajectoryStation: checkedTrajectoryStations[0].trajectoryStation, trajectory, dispatchOperation };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <TrajectoryStationPropertiesModal {...trajectoryStationPropertiesModalProps} />
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete selected trajectory stations?"}
        content={
          <span>
            This will permanently delete the selected trajectory stations: <strong>{checkedTrajectoryStations.map((item) => item.uid).join(", ")}</strong>
          </span>
        }
        onConfirm={onConfirmDelete}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onConfirmDelete = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const { wellUid, wellboreUid, uid } = trajectory;
    const job: DeleteTrajectoryStationJob = {
      trajectory: {
        wellUid,
        wellboreUid,
        trajectoryUid: uid
      },
      uids: checkedTrajectoryStations.map((item) => item.uid)
    };
    await JobService.orderJob(JobType.DeleteTrajectoryStations, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedTrajectoryStations.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedTrajectoryStations.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoryStationContextMenu;
