import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste, orderCopyJob } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface TrajectoriesContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const TrajectoriesContextMenu = (props: TrajectoriesContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers } = props;
  const trajectoryReferences = useClipboardReferencesOfType(ObjectType.Trajectory);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() =>
            onClickPaste(servers, trajectoryReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, trajectoryReferences, dispatchOperation, JobType.CopyTrajectory))
          }
          disabled={trajectoryReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory", trajectoryReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoriesContextMenu;
