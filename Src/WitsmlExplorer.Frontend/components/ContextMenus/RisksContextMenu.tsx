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

export interface RisksContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const RisksContextMenu = (props: RisksContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers } = props;
  const riskReferences = useClipboardReferencesOfType(ObjectType.Risk);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, riskReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, riskReferences, dispatchOperation, JobType.CopyRisk))}
          disabled={riskReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste risk{riskReferences?.objectUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RisksContextMenu;
