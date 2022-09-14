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

export interface ObjectsSidebarContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  wellbore: Wellbore;
  objectType: ObjectType;
  jobType: JobType;
}

const ObjectsSidebarContextMenu = (props: ObjectsSidebarContextMenuProps): React.ReactElement => {
  const { wellbore, dispatchOperation, servers, objectType, jobType } = props;
  const objectReferences = useClipboardReferencesOfType(objectType);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, objectReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, objectReferences, dispatchOperation, jobType))}
          disabled={objectReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", objectType, objectReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default ObjectsSidebarContextMenu;
