import { TextField } from "@equinor/eds-core-react";
import { Fragment } from "react";
import styled from "styled-components";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { getParentType } from "../../models/componentType";
import ComponentReferences from "../../models/jobs/componentReferences";
import { DeleteComponentsJob, DeleteObjectsJob } from "../../models/jobs/deleteJobs";
import ObjectOnWellbore, { toObjectReferences } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import AuthorizationService from "../../services/authorizationService";
import JobService, { JobType } from "../../services/jobService";
import Icon from "../../styles/Icons";
import ConfirmModal from "../Modals/ConfirmModal";
import { logTypeToQuery } from "../Routing";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export const pluralize = (text: string) => {
  return text.charAt(text.length - 1) == "y" ? text.slice(0, text.length - 1) + "ies" : text + "s";
};

export const pluralizeIfMultiple = (object: string, array: any[] | null) => {
  const objectLowercase = object.toLowerCase();
  const objectPlural = pluralize(objectLowercase);
  const isPlural = array ? array.length > 1 : false;
  return isPlural ? objectPlural : objectLowercase;
};

export const menuItemText = (operation: string, object: string, array: any[] | null) => {
  const operationUpperCase = operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase();
  const objectPlural = pluralizeIfMultiple(object, array);
  const count = array?.length > 0 ? ` ${array.length} ` : " ";
  return `${operationUpperCase}${count}${objectPlural}`;
};

export const onClickShowObjectOnServer = async (dispatchOperation: DispatchOperation, server: Server, objectOnWellbore: ObjectOnWellbore, objectType: ObjectType) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  const url = `${host}/?serverUrl=${server.url}&wellUid=${objectOnWellbore.wellUid}&wellboreUid=${objectOnWellbore.wellboreUid}&group=${objectType}&objectUid=${objectOnWellbore.uid}`;
  window.open(url);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickShowGroupOnServer = async (dispatchOperation: DispatchOperation, server: Server, wellbore: Wellbore, objectType: ObjectType, logTypeGroup: string = null) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  let url = `${host}/?serverUrl=${server.url}&wellUid=${wellbore.wellUid}&wellboreUid=${wellbore.uid}&group=${objectType}`;
  if (objectType === ObjectType.Log && logTypeGroup != null) {
    url += `&logType=${logTypeToQuery(logTypeGroup)}`;
  }
  window.open(url);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDeleteObjects = async (dispatchOperation: DispatchOperation, objectsOnWellbore: ObjectOnWellbore[], objectType: ObjectType) => {
  const pluralizedName = pluralizeIfMultiple(objectType, objectsOnWellbore);
  const orderDeleteJob = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteObjectsJob = {
      toDelete: toObjectReferences(objectsOnWellbore, objectType)
    };
    await JobService.orderJob(JobType.DeleteObjects, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };
  displayDeleteModal(
    pluralizedName,
    objectsOnWellbore.map((item) => item.name),
    orderDeleteJob,
    dispatchOperation,
    objectsOnWellbore[0].wellboreName
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
  displayDeleteModal(
    pluralizedName,
    componentReferences.componentUids,
    orderDeleteJob,
    dispatchOperation,
    componentReferences.parent.wellboreName,
    componentReferences.parent.name,
    getParentType(componentReferences.componentType)
  );
};

const displayDeleteModal = (
  toDeleteTypeName: string,
  toDeleteNames: string[],
  onDelete: () => void,
  dispatchOperation: DispatchOperation,
  wellbore: string,
  parent?: string,
  parentType?: string
) => {
  const confirmation = (
    <ConfirmModal
      heading={`Delete ${toDeleteTypeName}?`}
      content={
        <Layout>
          <TextField readOnly id="server" label="Server" defaultValue={AuthorizationService.selectedServer?.name} tabIndex={-1} />
          <TextField readOnly id="wellbore" label="Wellbore" defaultValue={wellbore} tabIndex={-1} />
          {parent != null && <TextField readOnly id="parent_object" label={parentType} defaultValue={parent} tabIndex={-1} />}
          <span>
            This will permanently delete {toDeleteNames.length} {toDeleteTypeName}:
            <strong>
              {toDeleteNames.map((name, index) => {
                return (
                  <Fragment key={index}>
                    <br />
                    {name}
                  </Fragment>
                );
              })}
            </strong>
          </span>
        </Layout>
      }
      onConfirm={onDelete}
      confirmColor={"danger"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;
