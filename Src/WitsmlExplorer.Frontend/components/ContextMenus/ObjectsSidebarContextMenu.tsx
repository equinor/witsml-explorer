import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import {
  ObjectTypeToTemplateObject,
  StoreFunction
} from "components/ContentViews/QueryViewUtils";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh,
  pluralize
} from "components/ContextMenus/ContextMenuUtils";
import { pasteObjectOnWellbore } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ObjectType } from "models/objectType";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface ObjectsSidebarContextMenuProps {
  wellbore: Wellbore;
  objectType: ObjectType;
  setIsLoading?: (arg: boolean) => void;
}

const ObjectsSidebarContextMenu = (
  props: ObjectsSidebarContextMenuProps
): React.ReactElement => {
  const { wellbore, objectType, setIsLoading } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const { dispatchNavigation } = useContext(NavigationContext);
  const {
    navigationState: { servers }
  } = useContext(NavigationContext);
  const objectReferences = useClipboardReferencesOfType(objectType);
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
              objectType,
              setIsLoading
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>{`Refresh ${pluralize(
            objectType
          )}`}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              objectReferences,
              dispatchOperation,
              wellbore
            )
          }
          disabled={objectReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", objectType, objectReferences?.objectUids)}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: ObjectTypeToTemplateObject[objectType],
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
              <Typography color={"primary"}>{`New ${objectType}`}</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default ObjectsSidebarContextMenu;
