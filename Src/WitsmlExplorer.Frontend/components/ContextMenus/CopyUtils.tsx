import { displayReplaceModal } from "components/Modals/ReplaceModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import ComponentReferences, {
  createComponentReferences
} from "models/jobs/componentReferences";
import {
  CopyComponentsJob,
  CopyObjectsJob,
  CopyWellboreWithObjectsJob
} from "models/jobs/copyJobs";
import ObjectReference from "models/jobs/objectReference";
import ObjectReferences from "models/jobs/objectReferences";
import WellboreReference, {
  toWellboreReference
} from "models/jobs/wellboreReference";
import ObjectOnWellbore, {
  toObjectReference,
  toObjectReferences
} from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import AuthorizationService from "services/authorizationService";
import JobService, { JobType } from "services/jobService";
import ObjectService from "services/objectService";
import { DeleteObjectsJob } from "models/jobs/deleteJobs";
import { ReplaceObjectsJob } from "models/jobs/replaceObjectsJob";
import LogObject from "models/logObject";
import Well from "models/well";
import Wellbore from "models/wellbore";
import WellReference from "models/jobs/wellReference";
import WellboreService from "services/wellboreService";
import NotificationService from "services/notificationService";

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
  wellboreReference: WellboreReference,
  targetServer: Server
) => {
  const server = servers.find((x) => x.url === objectReferences.serverUrl);
  dispatchOperation({ type: OperationType.HideContextMenu });
  const sourceQueries = objectReferences.objectUids.map((objectReference) =>
    ObjectService.getObject(
      objectReferences.wellUid,
      objectReferences.wellboreUid,
      objectReference,
      objectReferences.objectType,
      null,
      server
    )
  );

  const toCopy: ObjectOnWellbore[] = [];
  for (const query of sourceQueries) {
    const receivedObject = await query;
    toCopy.push(receivedObject);
  }

  const queries = objectReferences.objectUids.map((objectReference) =>
    ObjectService.getObject(
      wellboreReference.wellUid,
      wellboreReference.wellboreUid,
      objectReference,
      objectReferences.objectType,
      null,
      targetServer
    )
  );
  const existingObjects: ObjectOnWellbore[] = [];

  for (const query of queries) {
    const receivedObject = await query;

    if (
      objectReferences.objectUids.find(
        (objectToCopy) => receivedObject?.uid === objectToCopy
      )
    ) {
      existingObjects.push(receivedObject);
    }
  }

  if (existingObjects.length > 0) {
    displayModalForReplace(
      server,
      targetServer,
      toCopy,
      existingObjects,
      wellboreReference,
      objectReferences.objectType,
      dispatchOperation
    );
  } else {
    const orderCopyJob = () => {
      const copyJob: CopyObjectsJob = {
        source: objectReferences,
        target: wellboreReference
      };
      JobService.orderJob(JobType.CopyObjects, copyJob);
    };
    onClickPaste(servers, objectReferences?.serverUrl, orderCopyJob);
  }
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

export const pasteWellbore = async (
  servers: Server[],
  wellBore: WellboreReference,
  dispatchOperation: DispatchOperation,
  well: Well,
  connectedServer: Server
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const existingWellbores = await WellboreService.getWellbores(
    well.uid,
    null,
    connectedServer
  );
  const existingWellbore = existingWellbores.filter(
    (x) => x.uid === wellBore.wellboreUid || x.name === wellBore.wellboreName
  );
  if (existingWellbore.length > 0) {
    NotificationService.Instance.alertDispatcher.dispatch({
      serverUrl: new URL(connectedServer.url),
      message: `Wellbore ${wellBore.wellboreName} already exists on the target well.`,
      isSuccess: false,
      severity: "warning"
    });
  } else {
    const target: WellReference = {
      wellUid: well.uid,
      wellName: well.name
    };
    const orderCopyJob = () => {
      const copyJob = createCopyWellboreWithObjectsJob(wellBore, target);
      JobService.orderJob(JobType.CopyWellboreWithObjects, copyJob);
    };

    onClickPaste(servers, wellBore.server?.url, orderCopyJob);
  }
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

export const copyWellbore = async (
  wellbore: Wellbore,
  connectedServer: Server,
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellboreReference: WellboreReference = toWellboreReference(wellbore);
  wellboreReference.server = connectedServer;
  await navigator.clipboard.writeText(JSON.stringify(wellboreReference));
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

export const replaceObjects = async (
  sourceServer: Server,
  targetServer: Server,
  toCopy: ObjectOnWellbore[],
  toDelete: ObjectOnWellbore[],
  targetWellbore: WellboreReference,
  objectType: ObjectType,
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteObjectsJob = {
    toDelete: toObjectReferences(toDelete, objectType, targetServer.url)
  };
  const copyJob = createCopyJob(
    sourceServer,
    toCopy,
    targetWellbore,
    objectType
  );
  const replaceJob: ReplaceObjectsJob = { deleteJob, copyJob };
  await JobService.orderJobAtServer(
    JobType.ReplaceObjects,
    replaceJob,
    targetServer,
    sourceServer
  );
};

export function displayModalForReplace(
  sourceServer: Server,
  targetServer: Server,
  toCopy: ObjectOnWellbore[],
  existingObjects: ObjectOnWellbore[],
  wellboreReference: WellboreReference,
  objectType: ObjectType,
  dispatchOperation: DispatchOperation
) {
  const onConfirm = () =>
    replaceObjects(
      sourceServer,
      targetServer,
      toCopy,
      existingObjects,
      wellboreReference,
      objectType,
      dispatchOperation
    );
  displayReplaceModal(
    existingObjects,
    toCopy,
    objectType,
    "wellbore",
    dispatchOperation,
    onConfirm,
    (objectOnWellbore: ObjectOnWellbore) =>
      printObject(objectOnWellbore, objectType)
  );
}

export function printObject(
  objectOnWellbore: ObjectOnWellbore,
  objectType: ObjectType
): JSX.Element {
  return (
    <>
      <br />
      Name: {objectOnWellbore.name}
      <br />
      Uid: {objectOnWellbore.uid}
      {objectType === ObjectType.Log && (
        <>
          <br />
          Start index: {(objectOnWellbore as LogObject).startIndex}
          <br />
          End index: {(objectOnWellbore as LogObject).endIndex}
        </>
      )}
    </>
  );
}

export const createCopyJob = (
  sourceServer: Server,
  objects: ObjectOnWellbore[],
  targetWellbore: WellboreReference,
  objectType: ObjectType
): CopyObjectsJob => {
  const objectReferences: ObjectReferences = toObjectReferences(
    objects,
    objectType,
    sourceServer.url
  );
  const targetWellboreReference: WellboreReference = {
    wellUid: targetWellbore.wellUid,
    wellboreUid: targetWellbore.wellboreUid,
    wellName: targetWellbore.wellName,
    wellboreName: targetWellbore.wellboreName
  };
  return { source: objectReferences, target: targetWellboreReference };
};

export const createCopyWellboreWithObjectsJob = (
  sourceWellbore: WellboreReference,
  targetWell: WellReference
): CopyWellboreWithObjectsJob => {
  return { source: sourceWellbore, target: targetWell };
};
