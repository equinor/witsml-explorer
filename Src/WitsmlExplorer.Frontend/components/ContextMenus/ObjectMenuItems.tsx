import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { NavigationState } from "../../contexts/navigationContext";
import LogObject from "../../models/logObject";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { DispatchOperation, StyledIcon, menuItemText, onClickDeleteObjects, onClickShowGroupOnServer } from "./ContextMenuUtils";
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
  wellbore: Wellbore
): React.ReactElement[] => {
  const objectReferences = useClipboardReferencesOfType(objectType);
  const { selectedServer, servers } = navigationState;
  return [
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
    </MenuItem>,
    <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedObjects.length !== 1}>
      {servers.map((server: Server) => (
        <MenuItem key={server.name} onClick={() => onClickShowGroupOnServer(dispatchOperation, server, wellbore, objectType, (checkedObjects[0] as LogObject)?.indexType)}>
          <Typography color={"primary"}>{server.name}</Typography>
        </MenuItem>
      ))}
    </NestedMenuItem>
  ];
};
