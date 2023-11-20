import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { DispatchNavigation } from "../../contexts/navigationAction";
import { NavigationState } from "../../contexts/navigationContext";
import { DispatchOperation } from "../../contexts/operationStateReducer";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { StyledIcon, menuItemText, onClickDeleteObjects, onClickRefreshObject } from "./ContextMenuUtils";
import { onClickCopyToServer } from "./CopyToServer";
import { copyObjectOnWellbore, pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface ObjectContextMenuProps {
  checkedObjects: ObjectOnWellbore[];
  wellbore: Wellbore;
}

export const ObjectMenuItems = (
  checkedObjects: ObjectOnWellbore[],
  objectType: ObjectType,
  navigationState: NavigationState,
  dispatchOperation: DispatchOperation,
  dispatchNavigation: DispatchNavigation,
  wellbore: Wellbore
): React.ReactElement[] => {
  const objectReferences = useClipboardReferencesOfType(objectType);
  const { selectedServer, servers } = navigationState;

  return [
    <MenuItem key={"refresh"} onClick={() => onClickRefreshObject(checkedObjects[0], objectType, dispatchOperation, dispatchNavigation)} disabled={checkedObjects.length !== 1}>
      <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>{menuItemText("Refresh", objectType, null)}</Typography>
    </MenuItem>,
    <Divider key={"divider"} />,
    <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, checkedObjects, dispatchOperation, objectType)} disabled={checkedObjects.length === 0}>
      <StyledIcon name="copy" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>{menuItemText("copy", objectType, checkedObjects)}</Typography>
    </MenuItem>,
    <NestedMenuItem key={"copyToServer"} label={`${menuItemText("copy", objectType, checkedObjects)} to server`} disabled={checkedObjects.length === 0}>
      {servers.map(
        (server: Server) =>
          server.id !== selectedServer.id && (
            <MenuItem
              key={server.name}
              onClick={() => onClickCopyToServer(server, selectedServer, checkedObjects, objectType, dispatchOperation)}
              disabled={checkedObjects.length === 0}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          )
      )}
    </NestedMenuItem>,
    <MenuItem key={"pasteObject"} onClick={() => pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, wellbore)} disabled={objectReferences === null}>
      <StyledIcon name="paste" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>{menuItemText("paste", objectType, objectReferences?.objectUids)}</Typography>
    </MenuItem>,
    <MenuItem key={"delete"} onClick={() => onClickDeleteObjects(dispatchOperation, checkedObjects, objectType)} disabled={checkedObjects.length === 0}>
      <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>{menuItemText("delete", objectType, checkedObjects)}</Typography>
    </MenuItem>
  ];
};
