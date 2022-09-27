import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickShowOnServer, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { onClickCopy, onClickDelete } from "./TrajectoryContextMenuUtils";
import { orderCopyTrajectoryStationsJob, useClipboardTrajectoryStationReferences } from "./TrajectoryStationContextMenuUtils";

export interface TrajectorySidebarContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectorySidebarContextMenu = (props: TrajectorySidebarContextMenuProps): React.ReactElement => {
  const { dispatchOperation, trajectory, selectedServer, servers } = props;
  const [trajectoryStationReferences] = useClipboardTrajectoryStationReferences();

  const serverUrl = trajectoryStationReferences?.serverUrl;
  const orderCopy = () => orderCopyTrajectoryStationsJob(trajectory, trajectoryStationReferences, dispatchOperation);
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => onClickCopy(selectedServer, [trajectory], dispatchOperation)}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy trajectory</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, serverUrl, dispatchOperation, orderCopy)} disabled={trajectoryStationReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory station", trajectoryStationReferences?.trajectoryStationUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDelete([trajectory], dispatchOperation)}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete trajectory</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(dispatchOperation, server, trajectory, "trajectoryUid")}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TrajectorySidebarContextMenu;
