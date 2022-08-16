import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import { colors } from "../../styles/Colors";
import { Typography } from "@equinor/eds-core-react";
import Wellbore from "../../models/wellbore";
import { onClickPaste, useClipboardBhaRunReferences } from "./BhaRunContextMenuUtils";
import { StyledIcon } from "./ContextMenuUtils";

export interface BhaRunsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  wellbore: Wellbore;
}

const BhaRunsContextMenu = (props: BhaRunsContextMenuProps): React.ReactElement => {
  const { wellbore, dispatchOperation, servers } = props;
  const [bhaRunReferences] = useClipboardBhaRunReferences();

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, dispatchOperation, wellbore, bhaRunReferences)} disabled={bhaRunReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.bhaRunUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default BhaRunsContextMenu;
