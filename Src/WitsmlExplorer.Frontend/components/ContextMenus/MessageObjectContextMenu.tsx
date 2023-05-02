import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import MessageObject from "../../models/messageObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { colors } from "../../styles/Colors";
import MessageComparisonModal, { MessageComparisonModalProps } from "../Modals/MessageComparisonModal";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { DispatchOperation, StyledIcon, menuItemText } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";

const MessageObjectContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { servers, selectedServer } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyMessageObjectProps: MessagePropertiesModalProps = { mode, messageObject: checkedObjects[0] as MessageObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MessagePropertiesModal {...modifyMessageObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCompareMessageToServer = async (targetServer: Server, sourceServer: Server, messageToCompare: MessageObject, dispatchOperation: DispatchOperation) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const props: MessageComparisonModalProps = { sourceMessage: messageToCompare, sourceServer, targetServer, dispatchOperation };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <MessageComparisonModal {...props} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(checkedObjects, ObjectType.Message, navigationState, dispatchOperation, wellbore),
        <NestedMenuItem key={"compareToServer"} label={`${menuItemText("Compare", "message", [])} to server`} disabled={checkedObjects.length != 1} icon="compare">
          {servers.map(
            (server: Server) =>
              server.id !== selectedServer.id && (
                <MenuItem
                  key={server.name}
                  onClick={() => onClickCompareMessageToServer(server, selectedServer, checkedObjects[0] as MessageObject, dispatchOperation)}
                  disabled={checkedObjects.length != 1}
                >
                  <Typography color={"primary"}>{server.name}</Typography>
                </MenuItem>
              )
          )}
        </NestedMenuItem>,
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
