import { Typography } from "@equinor/eds-core-react";
import { Divider, ListItemIcon, MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteRigsJob } from "../../models/jobs/deleteJobs";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { RigRow } from "../ContentViews/RigsListView";
import ConfirmModal from "../Modals/ConfirmModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import RigPropertiesModal, { RigPropertiesModalProps } from "../Modals/RigPropertiesModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste, orderCopyJob } from "./CopyUtils";
import { onClickCopy } from "./RigContextMenuUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface RigContextMenuProps {
  checkedRigRows: RigRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wellbore: Wellbore;
  servers: Server[];
  selectedServer: Server;
}

const RigContextMenu = (props: RigContextMenuProps): React.ReactElement => {
  const { checkedRigRows, dispatchOperation, wellbore, servers, selectedServer } = props;
  const rigReferences = useClipboardReferencesOfType(ObjectType.Rig);
  const rigs = checkedRigRows.map((row) => row.rig);

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyRigObjectProps: RigPropertiesModalProps = { mode, rig: checkedRigRows[0].rig, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RigPropertiesModal {...modifyRigObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const deleteRigs = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteRigsJob = {
      toDelete: {
        objectUids: checkedRigRows.map((rig) => rig.uid),
        wellUid: checkedRigRows[0].wellUid,
        wellboreUid: checkedRigRows[0].wellboreUid,
        objectType: ObjectType.Rig
      }
    };
    await JobService.orderJob(JobType.DeleteRigs, job);
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
        <MenuItem key={"copy"} onClick={() => onClickCopy(selectedServer, rigs, dispatchOperation)} disabled={rigs.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "rig", rigs)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, rigReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, rigReferences, dispatchOperation, JobType.CopyRig))}
          disabled={rigReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "rig", rigReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedRigRows.length === 0}>
          <ListItemIcon>
            <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color="primary">{menuItemText("delete", "rig", rigs)}</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedRigRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RigContextMenu;
