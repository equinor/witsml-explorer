import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { v4 as uuid } from "uuid";
import { NavigationAction } from "../../contexts/navigationAction";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { StoreFunction, TemplateObjects } from "../ContentViews/QueryViewUtils";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { onClickRefreshAll } from "./TubularContextMenuUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface TubularsContextMenuProps {
  dispatchNavigation: (action: NavigationAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const TubularsContextMenu = (props: TubularsContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, wellbore, servers } = props;
  const tubularReferences = useClipboardReferencesOfType(ObjectType.Tubular);
  const openInQueryView = useOpenInQueryView();

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefreshAll(wellbore.wellUid, wellbore.uid, dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh tubulars</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, tubularReferences, dispatchOperation, wellbore)} disabled={tubularReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "tubular", tubularReferences?.objectUids)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Tubular,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: wellbore.uid,
                  objectUid: uuid()
                })
              }
            >
              <StyledIcon name="add" color={colors.interactive.primaryResting} />
              <Typography color={"primary"}>New Tubular</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TubularsContextMenu;
