import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreMessageAction, UpdateWellboreMessagesAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { JobType } from "../../services/jobService";
import MessageObjectService from "../../services/messageObjectService";
import { colors } from "../../styles/Colors";
import { MessageObjectRow } from "../ContentViews/MessagesListView";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickDelete, onClickShowOnServer, StyledIcon } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface MessageObjectContextMenuProps {
  checkedMessageObjectRows: MessageObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreMessagesAction | UpdateWellboreMessageAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const MessageObjectContextMenu = (props: MessageObjectContextMenuProps): React.ReactElement => {
  const { checkedMessageObjectRows, dispatchOperation, servers } = props;

  const onClickModify = async () => {
    const messageObject = await MessageObjectService.getMessage(checkedMessageObjectRows[0].wellUid, checkedMessageObjectRows[0].wellboreUid, checkedMessageObjectRows[0].uid);
    const mode = PropertiesModalMode.Edit;
    const modifyMessageObjectProps: MessagePropertiesModalProps = { mode, messageObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MessagePropertiesModal {...modifyMessageObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"delete"}
          onClick={() => onClickDelete(dispatchOperation, checkedMessageObjectRows, ObjectType.Message, JobType.DeleteMessageObjects)}
          disabled={checkedMessageObjectRows.length === 0}
        >
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "message", checkedMessageObjectRows)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedMessageObjectRows.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() => onClickShowOnServer(dispatchOperation, server, checkedMessageObjectRows[0], "messageUid")}
              disabled={checkedMessageObjectRows.length !== 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedMessageObjectRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MessageObjectContextMenu;
