import { TextField } from "@equinor/eds-core-react";
import { QueryClient } from "@tanstack/react-query";
import { WITSML_INDEX_TYPE, WITSML_INDEX_TYPE_MD } from "components/Constants";
import ConfirmModal from "components/Modals/ConfirmModal";
import { isExpandableGroupObject } from "components/Sidebar/ObjectGroupItem";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { refreshObjectsQuery } from "hooks/query/queryRefreshHelpers";
import { getParentType } from "models/componentType";
import { IndexCurve } from "models/indexCurve";
import ComponentReferences from "models/jobs/componentReferences";
import { DeleteComponentsJob, DeleteObjectsJob } from "models/jobs/deleteJobs";
import ObjectOnWellbore, { toObjectReferences } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import { Fragment } from "react";
import { RouterLogType } from "routes/routerConstants";
import {
  getLogObjectViewPath,
  getLogObjectsViewPath,
  getLogTypesViewPath,
  getObjectViewPath,
  getObjectsViewPath
} from "routes/utils/pathBuilder";
import AuthorizationService from "services/authorizationService";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import Icon from "styles/Icons";
import { openRouteInNewWindow } from "tools/windowHelpers";
import { ModalContentLayout } from "../StyledComponents/ModalContentLayout";

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
  dispatchOperation({ type: OperationType.HideContextMenu });
  let url = "";
  if (objectType === ObjectType.Log) {
    const logTypePath =
      indexCurve === IndexCurve.Depth
        ? RouterLogType.DEPTH
        : RouterLogType.TIME;
    url = getLogObjectViewPath(
      server.url,
      objectOnWellbore.wellUid,
      objectOnWellbore.wellboreUid,
      objectType,
      logTypePath,
      objectOnWellbore.uid
    );
  } else if (isExpandableGroupObject(objectType)) {
    url = getObjectViewPath(
      server.url,
      objectOnWellbore.wellUid,
      objectOnWellbore.wellboreUid,
      objectType,
      objectOnWellbore.uid
    );
  } else {
    url = getObjectsViewPath(
      server.url,
      objectOnWellbore.wellUid,
      objectOnWellbore.wellboreUid,
      objectType
    );
  }
  openRouteInNewWindow(url);
};

export const onClickShowGroupOnServer = async (
  dispatchOperation: DispatchOperation,
  server: Server,
  wellbore: Wellbore,
  objectType: ObjectType,
  indexType: WITSML_INDEX_TYPE = null
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  let url = "";
  if (objectType === ObjectType.Log && indexType) {
    const logTypePath =
      indexType === WITSML_INDEX_TYPE_MD
        ? RouterLogType.DEPTH
        : RouterLogType.TIME;
    url = getLogObjectsViewPath(
      server.url,
      wellbore.wellUid,
      wellbore.uid,
      objectType,
      logTypePath
    );
  } else if (objectType === ObjectType.Log) {
    url = getLogTypesViewPath(
      server.url,
      wellbore.wellUid,
      wellbore.uid,
      objectType
    );
  } else {
    url = getObjectsViewPath(
      server.url,
      wellbore.wellUid,
      wellbore.uid,
      objectType
    );
  }
  openRouteInNewWindow(url);
};

export const onClickDeleteObjects = async (
  dispatchOperation: DispatchOperation,
  objectsOnWellbore: ObjectOnWellbore[],
  objectType: ObjectType
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const pluralizedName = pluralizeIfMultiple(objectType, objectsOnWellbore);
  const orderDeleteJob = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteObjectsJob = {
      toDelete: toObjectReferences(objectsOnWellbore, objectType)
    };
    await JobService.orderJob(JobType.DeleteObjects, job);
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
  dispatchOperation({ type: OperationType.HideContextMenu });
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
  objectType: ObjectType
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
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
        <ModalContentLayout>
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
        </ModalContentLayout>
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
