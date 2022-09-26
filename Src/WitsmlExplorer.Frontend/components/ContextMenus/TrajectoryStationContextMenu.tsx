import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreTrajectoryAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { createTrajectoryStationReferences } from "../../models/jobs/copyTrajectoryStationJob";
import { DeleteTrajectoryStationsJob } from "../../models/jobs/deleteJobs";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { TrajectoryStationRow } from "../ContentViews/TrajectoryView";
import ConfirmModal from "../Modals/ConfirmModal";
import TrajectoryStationPropertiesModal from "../Modals/TrajectoryStationPropertiesModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import { orderCopyTrajectoryStationsJob, useClipboardTrajectoryStationReferences } from "./TrajectoryStationContextMenuUtils";

export interface TrajectoryStationContextMenuProps {
  checkedTrajectoryStations: TrajectoryStationRow[];
  dispatchNavigation: (action: UpdateWellboreTrajectoryAction) => void;
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectoryStationContextMenu = (props: TrajectoryStationContextMenuProps): React.ReactElement => {
  const { checkedTrajectoryStations, dispatchOperation, trajectory, selectedServer, servers } = props;
  const [trajectoryStationReferences] = useClipboardTrajectoryStationReferences();

  const onClickCopy = async () => {
    const trajectoryStationReferences = createTrajectoryStationReferences(checkedTrajectoryStations, trajectory, selectedServer.url);
    await navigator.clipboard.writeText(JSON.stringify(trajectoryStationReferences));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

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
    const job: DeleteTrajectoryStationsJob = {
      toDelete: {
        trajectoryReference: {
          wellUid,
          wellboreUid,
          uid: uid
        },
        trajectoryStationUids: checkedTrajectoryStations.map((item) => item.uid)
      }
    };
    await JobService.orderJob(JobType.DeleteTrajectoryStations, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const serverUrl = trajectoryStationReferences?.serverUrl;
  const orderCopy = () => orderCopyTrajectoryStationsJob(trajectory, trajectoryStationReferences, dispatchOperation);
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={onClickCopy} disabled={checkedTrajectoryStations.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "trajectory station", checkedTrajectoryStations)}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, serverUrl, dispatchOperation, orderCopy)} disabled={trajectoryStationReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory station", trajectoryStationReferences?.trajectoryStationUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedTrajectoryStations.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "trajectory station", checkedTrajectoryStations)}</Typography>
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
