import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import FormationMarker from "../../models/formationMarker";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickDeleteObjects, onClickShowGroupOnServer } from "./ContextMenuUtils";
import { copyObjectOnWellbore, pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface FormationMarkerContextMenuProps {
  formationMarkers: FormationMarker[];
}

const FormationMarkerContextMenu = (props: FormationMarkerContextMenuProps): React.ReactElement => {
  const { formationMarkers } = props;
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer, servers, selectedWellbore } = navigationState;
  const objectReferences = useClipboardReferencesOfType(ObjectType.FormationMarker);
  const { dispatchOperation } = useContext(OperationContext);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() => copyObjectOnWellbore(selectedServer, formationMarkers, dispatchOperation, ObjectType.FormationMarker)}
          disabled={formationMarkers.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "formationMarker", formationMarkers)}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, selectedWellbore)} disabled={objectReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "formationMarker", objectReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteObjects(dispatchOperation, formationMarkers, ObjectType.FormationMarker)} disabled={formationMarkers.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "formationMarker", formationMarkers)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowGroupOnServer(dispatchOperation, server, selectedWellbore, ObjectType.FormationMarker)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>
      ]}
    />
  );
};

export default FormationMarkerContextMenu;
