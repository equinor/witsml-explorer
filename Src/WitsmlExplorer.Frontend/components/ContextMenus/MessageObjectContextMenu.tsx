import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreMessageAction, UpdateWellboreMessagesAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteMessageObjectsJob } from "../../models/jobs/deleteJobs";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import MessageObjectService from "../../services/messageObjectService";
import { colors } from "../../styles/Colors";
import { MessageObjectRow } from "../ContentViews/MessagesListView";
import ConfirmModal from "../Modals/ConfirmModal";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";

export interface MessageObjectContextMenuProps {
  checkedMessageObjectRows: MessageObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreMessagesAction | UpdateWellboreMessageAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const MessageObjectContextMenu = (props: MessageObjectContextMenuProps): React.ReactElement => {
  const { checkedMessageObjectRows, dispatchOperation } = props;

  const deleteMessageObjects = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteMessageObjectsJob = {
      toDelete: {
        objectUids: checkedMessageObjectRows.map((row) => row.uid),
        wellUid: checkedMessageObjectRows[0].wellUid,
        wellboreUid: checkedMessageObjectRows[0].wellboreUid,
        objectType: ObjectType.Message
      }
    };

    await JobService.orderJob(JobType.DeleteMessageObjects, job);
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
    const modifyMessageObjectProps: MessagePropertiesModalProps = { mode, messageObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MessagePropertiesModal {...modifyMessageObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedMessageObjectRows.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "message", checkedMessageObjectRows)}</Typography>
        </MenuItem>,
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
