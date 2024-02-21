import { TextField } from "@equinor/eds-core-react";
import { QueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import styled from "styled-components";
import { DispatchOperation } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { refreshObjectsQuery } from "../../hooks/query/queryRefreshHelpers";
import { getParentType } from "../../models/componentType";
import ComponentReferences from "../../models/jobs/componentReferences";
import {
  DeleteComponentsJob,
  DeleteObjectsJob
} from "../../models/jobs/deleteJobs";
import ObjectOnWellbore, {
  toObjectReferences
} from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { RouterLogType } from "../../routes/routerConstants";
import AuthorizationService from "../../services/authorizationService";
import JobService, { JobType } from "../../services/jobService";
import Icon from "../../styles/Icons";
import ConfirmModal from "../Modals/ConfirmModal";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import { isExpandableGroupObject } from "../Sidebar/ObjectGroupItem";

const indexCurveToQuery = (indexCurve: IndexCurve) => {
  if (!indexCurve) return "logtypes";
  return indexCurve === IndexCurve.Depth
    ? `logtypes/${RouterLogType.DEPTH}/objects`
    : `logtypes/${RouterLogType.TIME}/objects`;
};

export const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export const pluralize = (text: string) => {
  return text.charAt(text.length - 1) == "y"
    ? text.slice(0, text.length - 1) + "ies"
    : text.charAt(text.length - 1) == "s"
    ? text
    : text + "s";
};

export const pluralizeIfMultiple = (object: string, array: any[] | null) => {
  const objectLowercase = object.toLowerCase();
  const objectPlural = pluralize(objectLowercase);
  const isPlural = array ? array.length > 1 : false;
  return isPlural ? objectPlural : objectLowercase;
};

export const menuItemText = (
  operation: string,
  object: string,
  array: any[] | null
) => {
  const operationUpperCase =
    operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase();
  const objectPlural = pluralizeIfMultiple(object, array);
  const count = array?.length > 0 ? ` ${array.length} ` : " ";
  return `${operationUpperCase}${count}${objectPlural}`;
};

export const onClickShowObjectOnServer = async (
  dispatchOperation: DispatchOperation,
  server: Server,
  objectOnWellbore: ObjectOnWellbore,
  objectType: ObjectType,
  indexCurve: IndexCurve = null
) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  const objectTypeString =
    objectType === ObjectType.Log ? indexCurveToQuery(indexCurve) : "objects";
  const objectString = isExpandableGroupObject(objectType)
    ? objectOnWellbore.uid
    : "";
  const url = `${host}/servers/${encodeURIComponent(server.url)}/wells/${
    objectOnWellbore.wellUid
  }/wellbores/${
    objectOnWellbore.wellboreUid
  }/objectgroups/${objectType}/${objectTypeString}/${objectString}`;
  window.open(url);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickShowGroupOnServer = async (
  dispatchOperation: DispatchOperation,
  server: Server,
  wellbore: Wellbore,
  objectType: ObjectType,
  indexCurve: IndexCurve = null
) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  const objectTypeString =
    objectType === ObjectType.Log ? indexCurveToQuery(indexCurve) : "objects";
  const url = `${host}/servers/${encodeURIComponent(server.url)}/wells/${
    wellbore.wellUid
  }/wellbores/${wellbore.uid}/objectgroups/${objectType}/${objectTypeString}`;
  window.open(url);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDeleteObjects = async (
  dispatchOperation: DispatchOperation,
  objectsOnWellbore: ObjectOnWellbore[],
  objectType: ObjectType
) => {
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

export const onClickDeleteComponents = async (
  dispatchOperation: DispatchOperation,
  componentReferences: ComponentReferences,
  jobType: JobType
) => {
  const pluralizedName = pluralizeIfMultiple(
    componentReferences.componentType,
    componentReferences.componentUids
  );
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

export const onClickRefresh = async (
  dispatchOperation: DispatchOperation,
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  refreshObjectsQuery(queryClient, serverUrl, wellUid, wellboreUid, objectType);
};

export const onClickRefreshObject = async (
  dispatchOperation: DispatchOperation,
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  objectUid: string
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  // TODO: For now, we are refreshing the entire list. See comment for refreshObjectQuery in queryRefreshHelpers.tsx.
  // If we find a solution, we should use refreshObjectQuery with the objectUid instead.
  refreshObjectsQuery(queryClient, serverUrl, wellUid, wellboreUid, objectType);
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
          <TextField
            readOnly
            id="server"
            label="Server"
            defaultValue={AuthorizationService.selectedServer?.name}
            tabIndex={-1}
          />
          <TextField
            readOnly
            id="wellbore"
            label="Wellbore"
            defaultValue={wellbore}
            tabIndex={-1}
          />
          {parent != null && (
            <TextField
              readOnly
              id="parent_object"
              label={parentType}
              defaultValue={parent}
              tabIndex={-1}
            />
          )}
          <span>
            This will permanently delete {toDeleteNames.length}{" "}
            {toDeleteTypeName}:
            <strong>
              {toDeleteNames.map((name, index) => {
                return (
                  <Fragment key={`${name}-${index}`}>
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
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmation
  });
};

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;
