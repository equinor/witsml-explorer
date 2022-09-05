import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { orderCopyJob, useClipboardBhaRunReferences } from "./BhaRunContextMenuUtils";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";

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
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, bhaRunReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, bhaRunReferences, dispatchOperation))}
          disabled={bhaRunReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.bhaRunUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default BhaRunsContextMenu;
