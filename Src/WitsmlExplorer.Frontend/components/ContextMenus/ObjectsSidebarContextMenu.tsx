import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface ObjectsSidebarContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  wellbore: Wellbore;
  objectType: ObjectType;
}

const ObjectsSidebarContextMenu = (props: ObjectsSidebarContextMenuProps): React.ReactElement => {
  const { wellbore, dispatchOperation, servers, objectType } = props;
  const objectReferences = useClipboardReferencesOfType(objectType);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, wellbore)} disabled={objectReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", objectType, objectReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default ObjectsSidebarContextMenu;
