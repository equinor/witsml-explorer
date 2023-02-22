import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import MudLog from "../../models/mudLog";
import { ObjectType } from "../../models/objectType";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickDeleteObjects, StyledIcon } from "./ContextMenuUtils";
import { copyObjectOnWellbore, pasteObjectOnWellbore } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface MudLogContextMenuProps {
  mudLogs: MudLog[];
}

const MudLogContextMenu = (props: MudLogContextMenuProps): React.ReactElement => {
  const { mudLogs } = props;
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer, servers, selectedWellbore } = navigationState;
  const mudLogReferences = useClipboardReferencesOfType(ObjectType.MudLog);
  const { dispatchOperation } = useContext(OperationContext);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, mudLogs, dispatchOperation, ObjectType.MudLog)} disabled={mudLogs.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "mudLog", mudLogs)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() => pasteObjectOnWellbore(servers, mudLogReferences, dispatchOperation, selectedWellbore, JobType.CopyMudLog)}
          disabled={mudLogReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "mudLog", mudLogReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteObjects(dispatchOperation, mudLogs, ObjectType.MudLog, JobType.DeleteMudLogs)} disabled={mudLogs.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "mudLog", mudLogs)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MudLogContextMenu;
