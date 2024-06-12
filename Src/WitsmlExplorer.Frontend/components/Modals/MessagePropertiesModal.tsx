import { TextField } from "@equinor/eds-core-react";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import MessageObject from "models/messageObject";
import { ObjectType } from "models/objectType";
import React, { ChangeEvent, useEffect, useState } from "react";
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
  } = useOperationState();
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

  const validName = validText(editableMessageObject?.name, 1, 64);
  const validMessageText = validText(
    editableMessageObject?.messageText,
    1,
    4000
  );

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
              />
              <TextField
                disabled
                id="dateTimeLastChange"
                label="last changed"
                defaultValue={editableMessageObject.commonData.dTimLastChange}
              />
              <TextField
                disabled
                id="uid"
                label="message uid"
                defaultValue={editableMessageObject.uid}
              />
              <TextField
                id="name"
                label="name"
                required
                defaultValue={editableMessageObject.name}
                variant={validName ? undefined : "error"}
                helperText={
                  !validName ? "The message name must be 1-64 characters" : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                multiline
                required
                variant={validMessageText ? undefined : "error"}
                helperText={
                  !validMessageText
                    ? "The message text must be 1-4000 characters"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableMessageObject.wellName}
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableMessageObject.wellboreUid}
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableMessageObject.wellboreName}
              />
            </>
          }
          confirmDisabled={!validName || !validMessageText}
          onSubmit={() => onSubmit(editableMessageObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default MessagePropertiesModal;
