import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import ComponentReferences, {
  createComponentReferences
} from "models/jobs/componentReferences";
import { CopyComponentsJob, CopyObjectsJob } from "models/jobs/copyJobs";
import ObjectReference from "models/jobs/objectReference";
import ObjectReferences from "models/jobs/objectReferences";
import WellboreReference from "models/jobs/wellboreReference";
import ObjectOnWellbore, {
  toObjectReference,
  toObjectReferences
} from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import AuthorizationService from "services/authorizationService";
import JobService, { JobType } from "services/jobService";

export const onClickPaste = (
  servers: Server[],
  sourceServerUrl: string,
  orderCopyJob: () => void
) => {
  const sourceServer = servers.find(
    (server) => server.url.toLowerCase() === sourceServerUrl.toLowerCase()
  );
  if (sourceServer !== null) {
    AuthorizationService.setSourceServer(sourceServer);
    orderCopyJob();
  }
};

export const pasteObjectOnWellbore = async (
  servers: Server[],
  objectReferences: ObjectReferences,
  dispatchOperation: DispatchOperation,
  wellboreReference: WellboreReference
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const orderCopyJob = () => {
    const copyJob: CopyObjectsJob = {
      source: objectReferences,
      target: wellboreReference
    };
    JobService.orderJob(JobType.CopyObjects, copyJob);
  };

  onClickPaste(servers, objectReferences?.serverUrl, orderCopyJob);
};

export const pasteComponents = async (
  servers: Server[],
  sourceReferences: ComponentReferences,
  dispatchOperation: DispatchOperation,
  target: ObjectOnWellbore
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const orderCopyJob = () => {
    const targetReference: ObjectReference = toObjectReference(target);
    const copyJob: CopyComponentsJob = {
      source: sourceReferences,
      target: targetReference
    };
    JobService.orderJob(JobType.CopyComponents, copyJob);
  };

  onClickPaste(servers, sourceReferences?.serverUrl, orderCopyJob);
};

export const copyObjectOnWellbore = async (
  selectedServer: Server,
  objectsOnWellbore: ObjectOnWellbore[],
  dispatchOperation: DispatchOperation,
  objectType: ObjectType
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const objectReferences: ObjectReferences = toObjectReferences(
    objectsOnWellbore,
    objectType,
    selectedServer.url
  );
  await navigator.clipboard.writeText(JSON.stringify(objectReferences));
};

export const copyComponents = async (
  selectedServer: Server,
  uids: string[],
  parent: ObjectOnWellbore,
  dispatchOperation: DispatchOperation,
  componentType: ComponentType
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const componentReferences: ComponentReferences = createComponentReferences(
    uids,
    parent,
    componentType,
    selectedServer.url
  );
  await navigator.clipboard.writeText(JSON.stringify(componentReferences));
};
