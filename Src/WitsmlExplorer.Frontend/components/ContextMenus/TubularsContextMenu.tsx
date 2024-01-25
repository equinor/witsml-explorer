import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import {
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh
} from "components/ContextMenus/ContextMenuUtils";
import { pasteObjectOnWellbore } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import { NavigationAction } from "contexts/navigationAction";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "contexts/operationStateReducer";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import React from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface TubularsContextMenuProps {
  dispatchNavigation: (action: NavigationAction) => void;
  dispatchOperation: (
    action: HideModalAction | HideContextMenuAction | DisplayModalAction
  ) => void;
  wellbore: Wellbore;
  servers?: Server[];
  setIsLoading?: (arg: boolean) => void;
}

const TubularsContextMenu = (
  props: TubularsContextMenuProps
): React.ReactElement => {
  const {
    dispatchNavigation,
    dispatchOperation,
    wellbore,
    servers,
    setIsLoading
  } = props;
  const tubularReferences = useClipboardReferencesOfType(ObjectType.Tubular);
  const openInQueryView = useOpenInQueryView();

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() =>
            onClickRefresh(
              dispatchOperation,
              dispatchNavigation,
              wellbore.wellUid,
              wellbore.uid,
              ObjectType.Tubular,
              setIsLoading
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Refresh tubulars</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              tubularReferences,
              dispatchOperation,
              wellbore
            )
          }
          disabled={tubularReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", "tubular", tubularReferences?.objectUids)}
          </Typography>
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
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Tubular</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TubularsContextMenu;
