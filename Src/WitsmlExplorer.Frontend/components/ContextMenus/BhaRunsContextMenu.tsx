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
import { StyledIcon } from "./ContextMenuUtils";
import { onClickPaste, orderCopyJob } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface BhaRunsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  wellbore: Wellbore;
}

const BhaRunsContextMenu = (props: BhaRunsContextMenuProps): React.ReactElement => {
  const { wellbore, dispatchOperation, servers } = props;
  const bhaRunReferences = useClipboardReferencesOfType(ObjectType.BhaRun);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() =>
            onClickPaste(servers, bhaRunReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, bhaRunReferences, dispatchOperation, JobType.CopyBhaRun))
          }
          disabled={bhaRunReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.objectUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default BhaRunsContextMenu;
