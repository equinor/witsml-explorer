import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
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
import { PropertiesModalMode } from "components/Modals/ModalParts";
import WbGeometryPropertiesModal, {
  WbGeometryPropertiesModalProps
} from "components/Modals/WbGeometryPropertiesModal";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import WbGeometryObject from "models/wbGeometry";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const WbGeometryObjectContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const wbGeometrySectionReferences = useClipboardComponentReferencesOfType(
    ComponentType.WbGeometrySection
  );
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const mode = PropertiesModalMode.Edit;
    const modifyWbGeometryObjectProps: WbGeometryPropertiesModalProps = {
      mode,
      wbGeometryObject: checkedObjects[0] as WbGeometryObject,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <WbGeometryPropertiesModal {...modifyWbGeometryObjectProps} />
    });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"paste"}
        onClick={() =>
          pasteComponents(
            servers,
            wbGeometrySectionReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={
          wbGeometrySectionReferences === null || checkedObjects.length !== 1
        }
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText(
            "paste",
            "wbGeometry section",
            wbGeometrySectionReferences?.componentUids
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
          ObjectType.WbGeometry,
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

export default WbGeometryObjectContextMenu;
