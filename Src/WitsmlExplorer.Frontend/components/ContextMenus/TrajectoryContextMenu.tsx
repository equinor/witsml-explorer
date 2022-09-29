import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import Wellbore from "../../models/wellbore";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickShowOnServer, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste, orderCopyJob } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { onClickCopy, onClickDelete } from "./TrajectoryContextMenuUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface TrajectoryContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  trajectories: Trajectory[];
  selectedServer: Server;
  servers: Server[];
  wellbore: Wellbore;
}

const TrajectoryContextMenu = (props: TrajectoryContextMenuProps): React.ReactElement => {
  const { dispatchOperation, trajectories, selectedServer, servers, wellbore } = props;
  const trajectoryReferences = useClipboardReferencesOfType(ObjectType.Trajectory);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => onClickCopy(selectedServer, trajectories, dispatchOperation)} disabled={trajectories.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "trajectory", trajectories)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            onClickPaste(servers, trajectoryReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, trajectoryReferences, dispatchOperation, JobType.CopyTrajectory))
          }
          disabled={trajectoryReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory", trajectoryReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDelete(trajectories, dispatchOperation)} disabled={trajectories.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "trajectory", trajectories)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={trajectories.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(dispatchOperation, server, trajectories[0], "trajectoryUid")} disabled={trajectories.length !== 1}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TrajectoryContextMenu;
