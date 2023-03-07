import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { ComponentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickDeleteObjects, onClickShowObjectOnServer, StyledIcon } from "./ContextMenuUtils";
import { copyObjectOnWellbore, pasteComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface TrajectorySidebarContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectorySidebarContextMenu = (props: TrajectorySidebarContextMenuProps): React.ReactElement => {
  const { dispatchOperation, trajectory, selectedServer, servers } = props;
  const trajectoryStationReferences = useClipboardComponentReferencesOfType(ComponentType.TrajectoryStation);
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, [trajectory], dispatchOperation, ObjectType.Trajectory)}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy trajectory</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() => pasteComponents(servers, trajectoryStationReferences, dispatchOperation, trajectory, JobType.CopyTrajectoryStations)}
          disabled={trajectoryStationReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory station", trajectoryStationReferences?.componentUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteObjects(dispatchOperation, [trajectory], ObjectType.Trajectory)}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete trajectory</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowObjectOnServer(dispatchOperation, server, trajectory, ObjectType.Trajectory)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TrajectorySidebarContextMenu;
