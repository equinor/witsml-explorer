import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import JobService, { JobType } from "../../services/jobService";
import { Server } from "../../models/server";
import ConfirmModal from "../Modals/ConfirmModal";
import { MessageObjectRow } from "../ContentViews/MessagesListView";
import { DeleteIcon, FormatLineSpacingIcon } from "../Icons";
import ModificationType from "../../contexts/modificationType";
import MessageObjectService from "../../services/messageObjectService";
import { UpdateWellboreMessageAction, UpdateWellboreMessagesAction } from "../../contexts/navigationStateReducer";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";

export interface MessageObjectContextMenuProps {
  checkedMessageObjectRows: MessageObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreMessagesAction | UpdateWellboreMessageAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const MessageObjectContextMenu = (props: MessageObjectContextMenuProps): React.ReactElement => {
  const { checkedMessageObjectRows, dispatchOperation, dispatchNavigation } = props;

  const deleteMessageObjects = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      messageObjects: checkedMessageObjectRows.map((row) => ({
        wellUid: row.wellUid,
        wellboreUid: row.wellboreUid,
        uid: row.uid
      }))
    };

    await JobService.orderJob(JobType.DeleteMessageObjects, job);
    const freshMessages = await MessageObjectService.getMessages(job.messageObjects[0].wellUid, job.messageObjects[0].wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateMessageObjects,
      payload: { wellUid: job.messageObjects[0].wellUid, wellboreUid: job.messageObjects[0].wellboreUid, messages: freshMessages }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };
  const blockStyle = {
    display: "grid"
  };
  const onClickDelete = async () => {
    const pluralize = (count: number, noun: string, suffix = "s") => (count > 1 ? `${noun + suffix}` : noun);
    const confirmation = (
      <ConfirmModal
        heading={`Delete ${pluralize(checkedMessageObjectRows.length, "message")}`}
        content={
          <span style={blockStyle}>
            This will permanently delete {checkedMessageObjectRows.length} {pluralize(checkedMessageObjectRows.length, "message")}
          </span>
        }
        onConfirm={deleteMessageObjects}
        confirmColor={"secondary"}
        confirmText={`Delete`}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickModify = async () => {
    const messageObject = await MessageObjectService.getMessage(checkedMessageObjectRows[0].wellUid, checkedMessageObjectRows[0].wellboreUid, checkedMessageObjectRows[0].uid);
    const mode = PropertiesModalMode.Edit;
    const modifyMessageObjectProps: MessagePropertiesModalProps = { mode, messageObject, dispatchOperation, dispatchNavigation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MessagePropertiesModal {...modifyMessageObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"modify"} onClick={onClickModify} disabled={checkedMessageObjectRows.length !== 1}>
          <ListItemIcon>
            <FormatLineSpacingIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Modify</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedMessageObjectRows.length === 0}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MessageObjectContextMenu;
