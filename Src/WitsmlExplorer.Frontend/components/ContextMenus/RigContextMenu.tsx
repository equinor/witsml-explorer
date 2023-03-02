import { Typography } from "@equinor/eds-core-react";
import { Divider, ListItemIcon, MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { RigRow } from "../ContentViews/RigsListView";
import { PropertiesModalMode } from "../Modals/ModalParts";
import RigPropertiesModal, { RigPropertiesModalProps } from "../Modals/RigPropertiesModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickDeleteObjects, onClickShowGroupOnServer, StyledIcon } from "./ContextMenuUtils";
import { copyObjectOnWellbore, pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
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

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, rigs, dispatchOperation, ObjectType.Rig)} disabled={rigs.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "rig", rigs)}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, rigReferences, dispatchOperation, wellbore)} disabled={rigReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "rig", rigReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteObjects(dispatchOperation, rigs, ObjectType.Rig)} disabled={checkedRigRows.length === 0}>
          <ListItemIcon>
            <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color="primary">{menuItemText("delete", "rig", rigs)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowGroupOnServer(dispatchOperation, server, wellbore, "rigGroupUid")}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
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
