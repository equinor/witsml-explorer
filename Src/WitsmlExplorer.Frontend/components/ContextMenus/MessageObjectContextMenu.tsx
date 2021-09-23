import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import JobService, { JobType } from "../../services/jobService";
import { Server } from "../../models/server";
import ConfirmModal from "../Modals/ConfirmModal";
import { MessageObjectRow } from "../ContentViews/MessagesListView";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import MessageObjectService from "../../services/messageObjectService";
import { UpdateWellboreMessageAction, UpdateWellboreMessagesAction } from "../../contexts/navigationStateReducer";
import MessagePropertiesModal, { MessagePropertiesModalProps } from "../Modals/MessagePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import styled from "styled-components";

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
    const job = {
      messageObjects: checkedMessageObjectRows.map((row) => ({
        wellUid: row.wellUid,
        wellboreUid: row.wellboreUid,
        uid: row.uid
      }))
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
        <MenuItem key={"modify"} onClick={onClickModify} disabled={checkedMessageObjectRows.length !== 1}>
          <ListItemIcon>
            <Icon name="formatLine" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <MenuTypography color={"primary"}>Modify</MenuTypography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedMessageObjectRows.length === 0}>
          <ListItemIcon>
            <Icon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <MenuTypography color={"primary"}>Delete</MenuTypography>
        </MenuItem>
      ]}
    />
  );
};

const MenuTypography = styled(Typography)`
  padding-left: 0.25rem;
`;

export default MessageObjectContextMenu;
