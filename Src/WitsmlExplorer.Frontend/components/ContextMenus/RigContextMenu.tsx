import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { UpdateWellboreRigsAction } from "../../contexts/navigationStateReducer";
import RigPropertiesModal, { RigPropertiesModalProps } from "../Modals/RigPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import { RigRow } from "../ContentViews/RigsListView";
import styled from "styled-components";
import JobService, { JobType } from "../../services/jobService";
import RigService from "../../services/rigService";
import ModificationType from "../../contexts/modificationType";
import ConfirmModal from "../Modals/ConfirmModal";

export interface RigContextMenuProps {
  checkedRigRows: RigRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreRigsAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const RigContextMenu = (props: RigContextMenuProps): React.ReactElement => {
  const { checkedRigRows, dispatchOperation, dispatchNavigation } = props;

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyRigObjectProps: RigPropertiesModalProps = { mode, rig: checkedRigRows[0].rig, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RigPropertiesModal {...modifyRigObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const deleteRigs = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      rigReferences: {
        rigUids: checkedRigRows.map((rig) => rig.uid),
        wellUid: checkedRigRows[0].wellUid,
        wellboreUid: checkedRigRows[0].wellboreUid
      }
    };
    await JobService.orderJob(JobType.DeleteRigs, job);
    const freshRigs = await RigService.getRigs(checkedRigRows[0].rig.wellUid, checkedRigRows[0].rig.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateRigsOnWellbore,
      payload: {
        wellUid: job.rigReferences.wellUid,
        wellboreUid: job.rigReferences.wellboreUid,
        rigs: freshRigs
      }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete Rig(s)"}
        content={
          <span>
            This will permanently delete Rigs: <strong>{checkedRigRows.map((item) => item.uid).join(", ")}</strong>
          </span>
        }
        confirmColor={"secondary"}
        onConfirm={() => deleteRigs()}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedRigRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedRigRows.length !== 1}>
          <ListItemIcon>
            <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color="primary">Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};
const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export default RigContextMenu;
