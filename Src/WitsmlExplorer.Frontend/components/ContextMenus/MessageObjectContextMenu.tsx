import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import MessageObject from "../../models/messageObject";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { colors } from "../../styles/Colors";
import MessageComparisonModal, { MessageComparisonModalProps } from "../Modals/MessageComparisonModal";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ObjectPickerModal, { ObjectPickerProps } from "../Modals/ObjectPickerModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";

const MessageObjectContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyMessageObjectProps: MessagePropertiesModalProps = { mode, messageObject: checkedObjects[0] as MessageObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MessagePropertiesModal {...modifyMessageObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCompare = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const onPicked = (targetObject: ObjectOnWellbore, targetServer: Server) => {
      const props: MessageComparisonModalProps = { sourceMessage: checkedObjects[0] as MessageObject, sourceServer: selectedServer, targetServer, targetObject, dispatchOperation };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <MessageComparisonModal {...props} />
      });
    };
    const props: ObjectPickerProps = { sourceObject: checkedObjects[0], objectType: ObjectType.Message, onPicked };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ObjectPickerModal {...props} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(checkedObjects, ObjectType.Message, navigationState, wellbore),
        <MenuItem key={"compare"} onClick={onClickCompare} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="compare" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{`${menuItemText("Compare", "message", [])}`}</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MessageObjectContextMenu;
