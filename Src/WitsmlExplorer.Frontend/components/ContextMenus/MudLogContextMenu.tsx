import { Divider, Typography } from "@equinor/eds-core-react";
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
import MudLogPropertiesModal, {
  MudLogPropertiesModalProps
} from "components/Modals/MudLogPropertiesModal";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ComponentType } from "models/componentType";
import MudLog from "models/mudLog";
import { ObjectType } from "models/objectType";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const MudLogContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers } = navigationState;
  const geologyIntervalReferences = useClipboardComponentReferencesOfType(
    ComponentType.GeologyInterval
  );
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const modifyMudLogProps: MudLogPropertiesModalProps = {
      mudLog: checkedObjects[0] as MudLog
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <MudLogPropertiesModal {...modifyMudLogProps} />
    });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"paste"}
        onClick={() =>
          pasteComponents(
            servers,
            geologyIntervalReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={
          geologyIntervalReferences === null || checkedObjects.length !== 1
        }
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText(
            "paste",
            "geology interval",
            geologyIntervalReferences?.componentUids
          )}
        </Typography>
      </MenuItem>,
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={onClickModify}
        disabled={checkedObjects.length !== 1}
      >
        <StyledIcon name="settings" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>Properties</Typography>
      </MenuItem>
    ];
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.MudLog,
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

export default MudLogContextMenu;
