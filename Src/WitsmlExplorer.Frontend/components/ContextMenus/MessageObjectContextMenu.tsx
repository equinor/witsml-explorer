import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreMessageAction, UpdateWellboreMessagesAction } from "../../contexts/modificationActions";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import MessageObject from "../../models/messageObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { MessageObjectRow } from "../ContentViews/MessagesListView";
import MessageComparisonModal, { MessageComparisonModalProps } from "../Modals/MessageComparisonModal";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { DispatchOperation, StyledIcon, menuItemText, onClickDeleteObjects, onClickShowGroupOnServer } from "./ContextMenuUtils";
import { copyObjectOnWellbore, pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface MessageObjectContextMenuProps {
  checkedMessageObjectRows: MessageObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreMessagesAction | UpdateWellboreMessageAction) => void;
  servers: Server[];
  selectedServer: Server;
  wellbore: Wellbore;
}

const MessageObjectContextMenu = (props: MessageObjectContextMenuProps): React.ReactElement => {
  const { checkedMessageObjectRows, dispatchOperation, servers, wellbore, selectedServer } = props;
  const messageReferences = useClipboardReferencesOfType(ObjectType.Message);
  const messages = checkedMessageObjectRows.map((row) => row.message);

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyMessageObjectProps: MessagePropertiesModalProps = { mode, messageObject: messages[0], dispatchOperation };
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
        <MenuItem key={"copy"} onClick={() => copyObjectOnWellbore(selectedServer, messages, dispatchOperation, ObjectType.Message)} disabled={messages.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "message", messages)}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, messageReferences, dispatchOperation, wellbore)} disabled={messageReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "message", messageReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteObjects(dispatchOperation, messages, ObjectType.Message)} disabled={messages.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "message", messages)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"compareToServer"} label={`${menuItemText("Compare", "message", [])} to server`} disabled={messages.length != 1} icon="compare">
          {servers.map(
            (server: Server) =>
              server.id !== selectedServer.id && (
                <MenuItem key={server.name} onClick={() => onClickCompareMessageToServer(server, selectedServer, messages[0], dispatchOperation)} disabled={messages.length != 1}>
                  <Typography color={"primary"}>{server.name}</Typography>
                </MenuItem>
              )
          )}
        </NestedMenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowGroupOnServer(dispatchOperation, server, wellbore, ObjectType.Message)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={messages.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MessageObjectContextMenu;
