import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import JobService, { JobType } from "../../services/jobService";
import { Server } from "../../models/server";
import ConfirmModal from "../Modals/ConfirmModal";
import { MessageObjectRow } from "../ContentViews/MessagesListView";

import { DeleteIcon } from "../Icons";

export interface MessageObjectContextMenuProps {
  checkedMessageObjectRows: MessageObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const MessageObjectContextMenu = (props: MessageObjectContextMenuProps): React.ReactElement => {
  const { checkedMessageObjectRows, dispatchOperation } = props;

  const deleteMessageObjects = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      messageReferences: checkedMessageObjectRows.map((row) => ({
        wellUid: row.wellUid,
        wellboreUid: row.wellboreUid,
        messageUid: row.uid
      }))
    };

    await JobService.orderJob(JobType.DeleteMessageObjects, job);
    //const freshMessages = await MessageObjectService.getMessages(job.messageReferences[0].wellUid, job.messageReferences[0].wellboreUid);

    dispatchOperation({ type: OperationType.HideContextMenu });
  };
  const blockStyle = {
    display: "grid"
  };
  const onClickDelete = async () => {
    const pluralize = (count: number, noun: string, suffix = "s") => (count > 1 ? `${count} ${noun + suffix}` : noun);
    const confirmation = (
      <ConfirmModal
        heading={`Delete ${pluralize(checkedMessageObjectRows.length, "selected message")}`}
        content={
          <span style={blockStyle}>
            This will permanently delete message: <strong>{checkedMessageObjectRows.map((item) => item.messageText).join("\n")}</strong>
          </span>
        }
        onConfirm={deleteMessageObjects}
        confirmColor={"secondary"}
        confirmText={`Delete ${pluralize(checkedMessageObjectRows.length, "message")}?`}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={onClickDelete}>
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
