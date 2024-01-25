import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import { BatchModifyMenuItem } from "components/ContextMenus/BatchModifyMenuItem";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import RigPropertiesModal, {
  RigPropertiesModalProps
} from "components/Modals/RigPropertiesModal";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const RigContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const mode = PropertiesModalMode.Edit;
    const modifyRigObjectProps: RigPropertiesModalProps = {
      mode,
      rig: checkedObjects[0] as Rig,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <RigPropertiesModal {...modifyRigObjectProps} />
    });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <Divider key={"divider"} />,
      <BatchModifyMenuItem
        key="batchModify"
        checkedObjects={checkedObjects}
        objectType={ObjectType.Rig}
      />,
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
          ObjectType.Rig,
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

export default RigContextMenu;
