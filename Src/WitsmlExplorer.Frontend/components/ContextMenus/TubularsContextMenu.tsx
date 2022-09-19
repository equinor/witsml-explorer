import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste, orderCopyJob } from "./CopyUtils";
import { onClickRefreshAll } from "./TubularContextMenuUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface TubularsContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTubularsAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const TubularsContextMenu = (props: TubularsContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, wellbore, servers } = props;
  const tubularReferences = useClipboardReferencesOfType(ObjectType.Tubular);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefreshAll(wellbore.wellUid, wellbore.uid, dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh tubulars</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            onClickPaste(servers, tubularReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, tubularReferences, dispatchOperation, JobType.CopyTubular))
          }
          disabled={tubularReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "tubular", tubularReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularsContextMenu;
