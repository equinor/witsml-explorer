import { TextField } from "@mui/material";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import MessageObject from "models/messageObject";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface MessagePropertiesModalProps {
  mode: PropertiesModalMode;
  messageObject: MessageObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const MessagePropertiesModal = (
  props: MessagePropertiesModalProps
): React.ReactElement => {
  const { mode, messageObject, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [editableMessageObject, setEditableMessageObject] =
    useState<MessageObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableMessageObject({
      ...messageObject,
      commonData: {
        ...messageObject.commonData,
        dTimCreation: formatDateString(
          messageObject.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          messageObject.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      }
    });
  }, [messageObject]);

  const onSubmit = async (updatedMessage: MessageObject) => {
    setIsLoading(true);
    const modifyJob = {
      object: { ...updatedMessage, objectType: ObjectType.Message },
      objectType: ObjectType.Message
    };
    await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableMessageObject && (
        <ModalDialog
          heading={
            editMode
              ? `Edit properties for ${editableMessageObject.name}`
              : `New Log`
          }
          content={
            <>
              <TextField
                disabled
                id="dateTimeCreation"
                label="created"
                defaultValue={editableMessageObject.commonData.dTimCreation}
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeLastChange"
                label="last changed"
                defaultValue={editableMessageObject.commonData.dTimLastChange}
                fullWidth
              />
              <TextField
                disabled
                id="uid"
                label="message uid"
                defaultValue={editableMessageObject.uid}
                fullWidth
              />
              <TextField
                id="name"
                label="name"
                required
                defaultValue={editableMessageObject.name}
                error={editableMessageObject.name.length === 0}
                helperText={
                  editableMessageObject.name.length === 0
                    ? "The message name must be 1-64 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableMessageObject({
                    ...editableMessageObject,
                    name: e.target.value
                  })
                }
              />
              <TextField
                id="messageText"
                label="messageText"
                value={editableMessageObject.messageText}
                fullWidth
                multiline
                required
                error={!validText(editableMessageObject.messageText)}
                helperText={
                  editableMessageObject.messageText.length === 0
                    ? "The message text must be 1-4000 characters"
                    : ""
                }
                inputProps={{ minLength: 1, maxLength: 4000 }}
                onChange={(e) =>
                  setEditableMessageObject({
                    ...editableMessageObject,
                    messageText: e.target.value
                  })
                }
              />
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableMessageObject.wellUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableMessageObject.wellName}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableMessageObject.wellboreUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableMessageObject.wellboreName}
                fullWidth
              />
            </>
          }
          confirmDisabled={
            !validText(editableMessageObject.messageText) ||
            !validText(editableMessageObject.name)
          }
          onSubmit={() => onSubmit(editableMessageObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default MessagePropertiesModal;
