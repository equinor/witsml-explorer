import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ObjectType } from "../../models/objectType";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import {
  ObjectTypeToTemplateObject,
  StoreFunction
} from "../ContentViews/QueryViewUtils";
import ContextMenu from "./ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh,
  pluralize
} from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

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
