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

export interface RigsContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const RigsContextMenu = (props: RigsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers } = props;
  const rigReferences = useClipboardReferencesOfType(ObjectType.Rig);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, rigReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, rigReferences, dispatchOperation, JobType.CopyRig))}
          disabled={rigReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste rig{rigReferences?.objectUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RigsContextMenu;
