import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import RiskPropertiesModal, {
  RiskPropertiesModalProps
} from "components/Modals/RiskPropertiesModal";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ObjectType } from "models/objectType";
import RiskObject from "models/riskObject";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const RiskObjectContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const mode = PropertiesModalMode.Edit;
    const modifyRiskObjectProps: RiskPropertiesModalProps = {
      mode,
      riskObject: checkedObjects[0] as RiskObject,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <RiskPropertiesModal {...modifyRiskObjectProps} />
    });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
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
          ObjectType.Risk,
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

export default RiskObjectContextMenu;
