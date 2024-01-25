import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText
} from "components/ContextMenus/ContextMenuUtils";
import { pasteComponents } from "components/ContextMenus/CopyUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const FluidsReportContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();
  const fluidReferences = useClipboardComponentReferencesOfType(
    ComponentType.Fluid
  );

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"pasteComponent"}
        onClick={() =>
          pasteComponents(
            servers,
            fluidReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={fluidReferences === null || checkedObjects.length !== 1}
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText("paste", "fluid", fluidReferences?.componentUids)}
        </Typography>
      </MenuItem>
    ];
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.FluidsReport,
          navigationState,
          dispatchOperation,
          dispatchNavigation,
          openInQueryView,
          wellbore,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default FluidsReportContextMenu;
