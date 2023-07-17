import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { ObjectType } from "../../models/objectType";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickRefresh, pluralize } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface ObjectsSidebarContextMenuProps {
  wellbore: Wellbore;
  objectType: ObjectType;
  setIsLoading?: (arg: boolean) => void;
}

const ObjectsSidebarContextMenu = (props: ObjectsSidebarContextMenuProps): React.ReactElement => {
  const { wellbore, objectType, setIsLoading } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const { dispatchNavigation } = useContext(NavigationContext);
  const {
    navigationState: { servers }
  } = useContext(NavigationContext);
  const objectReferences = useClipboardReferencesOfType(objectType);

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefresh(dispatchOperation, dispatchNavigation, wellbore.wellUid, wellbore.uid, objectType, setIsLoading)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{`Refresh ${pluralize(objectType)}`}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, wellbore)} disabled={objectReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", objectType, objectReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default ObjectsSidebarContextMenu;
