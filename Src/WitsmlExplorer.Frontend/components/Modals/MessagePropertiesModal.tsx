import { TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import MessageObject from "../../models/messageObject";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";
import { PropertiesModalMode, validText } from "./ModalParts";

export interface MessagePropertiesModalProps {
  mode: PropertiesModalMode;
  messageObject: MessageObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const MessagePropertiesModal = (props: MessagePropertiesModalProps): React.ReactElement => {
  const { mode, messageObject, dispatchOperation } = props;
  const [editableMessageObject, setEditableMessageObject] = useState<MessageObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableMessageObject(messageObject);
  }, [messageObject]);

  const onSubmit = async (updatedMessage: MessageObject) => {
    setIsLoading(true);
    const wellboreMessageJob = {
      messageObject: updatedMessage
    };
    await JobService.orderJob(JobType.ModifyMessageObject, wellboreMessageJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableMessageObject && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableMessageObject.name}` : `New Log`}
          content={
            <>
              <TextField disabled id="dateTimeCreation" label="created" defaultValue={editableMessageObject.dateTimeCreation} fullWidth />
              <TextField disabled id="dateTimeLastChange" label="last changed" defaultValue={editableMessageObject.dateTimeLastChange} fullWidth />
              <TextField disabled id="uid" label="message uid" defaultValue={editableMessageObject.uid} fullWidth />
              <TextField
                id="name"
                label="name"
                required
                defaultValue={editableMessageObject.name}
                error={editableMessageObject.name.length === 0}
                helperText={editableMessageObject.name.length === 0 ? "The message name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableMessageObject({ ...editableMessageObject, name: e.target.value })}
              />
              <TextField
                id="messageText"
                label="messageText"
                value={editableMessageObject.messageText}
                fullWidth
                required
                error={!validText(editableMessageObject.messageText)}
                helperText={editableMessageObject.messageText.length === 0 ? "The message text must be 1-64 characters" : ""}
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableMessageObject({ ...editableMessageObject, messageText: e.target.value })}
              />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableMessageObject.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableMessageObject.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableMessageObject.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableMessageObject.wellboreName} fullWidth />
            </>
          }
          confirmDisabled={!validText(editableMessageObject.messageText) || !validText(editableMessageObject.name)}
          onSubmit={() => onSubmit(editableMessageObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default MessagePropertiesModal;
