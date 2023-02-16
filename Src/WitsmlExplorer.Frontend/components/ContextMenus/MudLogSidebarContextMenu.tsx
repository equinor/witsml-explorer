import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import MudLog from "../../models/mudLog";
import { ObjectType } from "../../models/objectType";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { copyObjectOnWellbore } from "./CopyUtils";

export interface MudLogSidebarContextMenuProps {
  mudLog: MudLog;
}

const MudLogSidebarContextMenu = (props: MudLogSidebarContextMenuProps): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, [props.mudLog], dispatchOperation, ObjectType.MudLog)}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "mudLog", [props.mudLog])}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MudLogSidebarContextMenu;
