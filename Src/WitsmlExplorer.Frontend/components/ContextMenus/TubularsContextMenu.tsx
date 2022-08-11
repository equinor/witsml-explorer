import React from "react";
import ContextMenu from "./ContextMenu";
import { MenuItem } from "@material-ui/core";
import { colors } from "../../styles/Colors";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import Wellbore from "../../models/wellbore";
import { onClickPaste, onClickRefreshAll, useClipboardTubularReferences } from "./TubularContextMenuUtils";
import { UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import { StyledIcon } from "./ContextMenuUtils";

export interface TubularsContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTubularsAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const TubularsContextMenu = (props: TubularsContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, wellbore, servers } = props;
  const [tubularReferences] = useClipboardTubularReferences();

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefreshAll(wellbore.wellUid, wellbore.uid, dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh tubulars</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, dispatchOperation, wellbore, tubularReferences)} disabled={tubularReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste tubular{tubularReferences?.tubularUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularsContextMenu;
