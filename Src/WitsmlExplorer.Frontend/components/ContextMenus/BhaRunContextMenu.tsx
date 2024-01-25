import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import BhaRunPropertiesModal, {
  BhaRunPropertiesModalProps
} from "components/Modals/BhaRunPropertiesModal";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import BhaRun from "models/bhaRun";
import { ObjectType } from "models/objectType";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const BhaRunContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const mode = PropertiesModalMode.Edit;
    const modifyBhaRunProps: BhaRunPropertiesModalProps = {
      mode,
      bhaRun: checkedObjects[0] as BhaRun,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <BhaRunPropertiesModal {...modifyBhaRunProps} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.BhaRun,
          navigationState,
          dispatchOperation,
          dispatchNavigation,
          openInQueryView,
          wellbore,
          []
        ),
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={onClickModify}
          disabled={checkedObjects.length !== 1}
        >
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default BhaRunContextMenu;
