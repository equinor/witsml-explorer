import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import { orderCopyJob, useClipboardTrajectoryReferences } from "./TrajectoryContextMenuUtils";

export interface TrajectoriesContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const TrajectoriesContextMenu = (props: TrajectoriesContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers } = props;
  const [trajectoryReferences] = useClipboardTrajectoryReferences();

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, trajectoryReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, trajectoryReferences, dispatchOperation))}
          disabled={trajectoryReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory", trajectoryReferences?.trajectoryUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoriesContextMenu;
