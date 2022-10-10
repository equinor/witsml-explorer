import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreTubularAction, UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TubularPropertiesModal from "../Modals/TubularPropertiesModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickDelete, onClickShowOnServer, StyledIcon } from "./ContextMenuUtils";
import { copyObjectOnWellbore, onClickPaste } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { orderCopyTubularComponentsJob, useClipboardTubularComponentReferences } from "./TubularComponentContextMenuUtils";
import { onClickRefresh } from "./TubularContextMenuUtils";

export interface TubularSidebarContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTubularsAction | UpdateWellboreTubularAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  tubular: Tubular;
  selectedServer: Server;
  servers: Server[];
}

const TubularSidebarContextMenu = (props: TubularSidebarContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, tubular, selectedServer, servers } = props;
  const [tubularComponentReferences] = useClipboardTubularComponentReferences();

  const onClickProperties = async () => {
    const tubularPropertiesModalProps = { mode: PropertiesModalMode.Edit, tubular, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TubularPropertiesModal {...tubularPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const serverUrl = tubularComponentReferences?.serverUrl;
  const orderCopy = () => orderCopyTubularComponentsJob(tubular, tubularComponentReferences, dispatchOperation);
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefresh(tubular, dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh tubular</Typography>
        </MenuItem>,
        <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, [tubular], dispatchOperation, ObjectType.Tubular)}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy tubular</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, serverUrl, dispatchOperation, orderCopy)} disabled={tubularComponentReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "tubular component", tubularComponentReferences?.tubularComponentUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDelete(dispatchOperation, [tubular], ObjectType.Tubular, JobType.DeleteTubulars)}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete tubular</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(dispatchOperation, server, tubular, "tubularUid")}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularSidebarContextMenu;
