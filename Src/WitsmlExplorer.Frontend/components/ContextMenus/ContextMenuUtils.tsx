import styled from "styled-components";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import ComponentReferences from "../../models/jobs/componentReferences";
import { DeleteComponentsJob, DeleteObjectsJob } from "../../models/jobs/deleteJobs";
import ObjectOnWellbore, { toObjectReferences } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import Icon from "../../styles/Icons";
import ConfirmModal from "../Modals/ConfirmModal";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import { QueryParams } from "../Routing";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export const pluralizeIfMultiple = (object: string, array: any[] | null) => {
  const objectLowercase = object.toLowerCase();
  const objectPlural = objectLowercase.charAt(object.length - 1) == "y" ? objectLowercase.slice(0, object.length - 1) + "ies" : objectLowercase + "s";
  const isPlural = array ? array.length > 1 : false;
  return isPlural ? objectPlural : objectLowercase;
};

export const menuItemText = (operation: string, object: string, array: any[] | null) => {
  const operationUpperCase = operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase();
  const objectPlural = pluralizeIfMultiple(object, array);
  const count = array?.length > 0 ? ` ${array.length} ` : " ";
  return `${operationUpperCase}${count}${objectPlural}`;
};

export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, onSuccess: () => void, message: string) => {
  const onConnectionVerified = async (credentials: BasicServerCredentials) => {
    CredentialsService.saveCredentials(credentials);
    onSuccess();
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: message,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};

export const onClickShowOnServer = async (dispatchOperation: DispatchOperation, server: Server, objectOnWellbore: ObjectOnWellbore, paramName: keyof QueryParams) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  const logUrl = `${host}/?serverUrl=${server.url}&wellUid=${objectOnWellbore.wellUid}&wellboreUid=${objectOnWellbore.wellboreUid}&${paramName}=${objectOnWellbore.uid}`;
  window.open(logUrl);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDeleteObjects = async (dispatchOperation: DispatchOperation, objectsOnWellbore: ObjectOnWellbore[], objectType: ObjectType, jobType: JobType) => {
  const pluralizedName = pluralizeIfMultiple(objectType, objectsOnWellbore);
  const orderDeleteJob = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteObjectsJob = {
      toDelete: toObjectReferences(objectsOnWellbore, objectType)
    };
    await JobService.orderJob(jobType, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };
  displayDeleteModal(
    pluralizedName,
    objectsOnWellbore.map((item) => item.name),
    orderDeleteJob,
    dispatchOperation
  );
};

export const onClickDeleteComponents = async (dispatchOperation: DispatchOperation, componentReferences: ComponentReferences, jobType: JobType) => {
  const pluralizedName = pluralizeIfMultiple(componentReferences.componentType, componentReferences.componentUids);
  const orderDeleteJob = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteComponentsJob = {
      toDelete: componentReferences
    };
    await JobService.orderJob(jobType, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };
  displayDeleteModal(pluralizedName, componentReferences.componentUids, orderDeleteJob, dispatchOperation);
};

const displayDeleteModal = (toDeleteTypeName: string, toDeleteNames: string[], onDelete: () => void, dispatchOperation: DispatchOperation) => {
  const confirmation = (
    <ConfirmModal
      heading={`Delete ${toDeleteTypeName}?`}
      content={
        <span>
          This will permanently delete {toDeleteTypeName}: <strong>{toDeleteNames.join(", ")}</strong>
        </span>
      }
      onConfirm={onDelete}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
