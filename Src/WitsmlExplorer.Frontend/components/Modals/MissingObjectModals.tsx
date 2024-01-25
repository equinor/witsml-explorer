import { TextField, Typography } from "@equinor/eds-core-react";
import ConfirmModal from "components/Modals/ConfirmModal";
import { ModalContentLayout } from "components/Modals/ModalDialog";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";

export function displayMissingWellboreModal(
  targetServer: Server,
  wellUid: string,
  wellboreUid: string,
  dispatchOperation: DispatchOperation,
  message = ""
) {
  const confirmation = (
    <ConfirmModal
      heading={`Wellbore not found`}
      content={
        <ModalContentLayout>
          <Typography>Unable to find wellbore</Typography>
          <TextField
            readOnly
            id="targetServer"
            label="Target Server Name"
            defaultValue={targetServer.name}
          />
          <TextField
            readOnly
            id="wellUid"
            label="Well UID"
            defaultValue={wellUid}
          />
          <TextField
            readOnly
            id="wellboreUid"
            label="Wellbore UID"
            defaultValue={wellboreUid}
          />
          <Typography>{message}</Typography>
        </ModalContentLayout>
      }
      onConfirm={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
    />
  );
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmation
  });
}

export function displayMissingObjectModal(
  targetServer: Server,
  wellUid: string,
  wellboreUid: string,
  logUid: string,
  dispatchOperation: DispatchOperation,
  message = "",
  objectType: ObjectType
) {
  const confirmation = (
    <ConfirmModal
      heading={`${objectType} not found`}
      content={
        <ModalContentLayout>
          <Typography>Unable to find {objectType}</Typography>
          <TextField
            readOnly
            id="targetServer"
            label="Target Server Name"
            defaultValue={targetServer.name}
          />
          <TextField
            readOnly
            id="wellUid"
            label="Well UID"
            defaultValue={wellUid}
          />
          <TextField
            readOnly
            id="wellboreUid"
            label="Wellbore UID"
            defaultValue={wellboreUid}
          />
          <TextField
            readOnly
            id="objectUid"
            label={`${objectType} UID`}
            defaultValue={logUid}
          />
          <Typography>{message}</Typography>
        </ModalContentLayout>
      }
      onConfirm={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
    />
  );
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmation
  });
}
