import { displayCopyWellboreModal } from "components/Modals/CopyWellboreModal";
import { displayReplaceModal } from "components/Modals/ReplaceModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import {
  CopyObjectsJob,
  CopyWellboreJob,
  CopyWellJob,
  CopyWithParentJob
} from "models/jobs/copyJobs";
import { DeleteObjectsJob } from "models/jobs/deleteJobs";
import ObjectReferences from "models/jobs/objectReferences";
import { ReplaceObjectsJob } from "models/jobs/replaceObjectsJob";
import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";
import LogObject from "models/logObject";
import ObjectOnWellbore, { toObjectReferences } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import AuthorizationService from "services/authorizationService";
import JobService, { JobType } from "services/jobService";
import ObjectService from "services/objectService";
import WellboreService from "services/wellboreService";
import UidMappingService from "../../services/uidMappingService.tsx";
import { UidMappingDbQuery } from "../../models/uidMapping.tsx";

export const onClickCopyToServer = async (
  targetServer: Server,
  sourceServer: Server,
  toCopy: ObjectOnWellbore[],
  objectType: ObjectType,
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const sourceWellUid = toCopy[0].wellUid;
  const sourceWellboreUid = toCopy[0].wellboreUid;
  const sourceWellName = toCopy[0].wellName;
  const sourceWellboreName = toCopy[0].wellboreName;

  let targetWellboreRef: WellboreReference;

  const dbQuery: UidMappingDbQuery = {
    sourceServerId: sourceServer.id,
    sourceWellId: sourceWellUid,
    sourceWellboreId: sourceWellboreUid,
    targetServerId: targetServer.id
  };

  const mappings = await UidMappingService.queryUidMapping(dbQuery);

  if (mappings.length > 0) {
    targetWellboreRef = {
      wellUid: mappings[0].targetWellId,
      wellboreUid: mappings[0].targetWellboreId,
      wellName: sourceWellName,
      wellboreName: sourceWellboreName
    };
  } else {
    targetWellboreRef = {
      wellUid: sourceWellUid,
      wellboreUid: sourceWellboreUid,
      wellName: sourceWellName,
      wellboreName: sourceWellboreName
    };
  }

  let wellbore: Wellbore;
  try {
    wellbore = await WellboreService.getWellbore(
      targetWellboreRef.wellUid,
      targetWellboreRef.wellboreUid,
      null,
      targetServer
    );
  } catch {
    return; // Cancel the operation if unable to authorize to the target server.
  }

  if (!!wellbore && mappings.length > 0) {
    targetWellboreRef.wellName = wellbore.wellName;
    targetWellboreRef.wellboreName = wellbore.name;
  }

  if (!wellbore) {
    // The wellbore was not found on the target server.
    const onConfirm = () => {
      dispatchOperation({ type: OperationType.HideModal });
      const copyWithParentJob = createCopyWithParentJob(
        sourceServer,
        toCopy,
        targetWellboreRef,
        objectType
      );
      AuthorizationService.setSourceServer(sourceServer);
      JobService.orderJobAtServer(
        JobType.CopyWithParent,
        copyWithParentJob,
        targetServer,
        sourceServer
      );
    };
    displayCopyWellboreModal(sourceWellboreUid, dispatchOperation, onConfirm);
    return;
  }

  confirmedCopyToServer(
    sourceWellUid,
    sourceWellboreUid,
    targetWellboreRef,
    targetServer,
    sourceServer,
    toCopy,
    objectType,
    dispatchOperation
  );
};

const confirmedCopyToServer = async (
  wellUid: string,
  wellboreUid: string,
  targetWellbore: WellboreReference,
  targetServer: Server,
  sourceServer: Server,
  toCopy: ObjectOnWellbore[],
  objectType: ObjectType,
  dispatchOperation: DispatchOperation
) => {
  const queries = toCopy.map((objectOnWellbore) =>
    ObjectService.getObject(
      wellUid,
      wellboreUid,
      objectOnWellbore.uid,
      objectType,
      null,
      targetServer
    )
  );
  const existingObjects: ObjectOnWellbore[] = [];
  for (const query of queries) {
    const receivedObject = await query;
    if (
      toCopy.find((objectToCopy) => receivedObject?.uid === objectToCopy.uid)
    ) {
      existingObjects.push(receivedObject);
    }
  }
  if (existingObjects.length > 0) {
    const onConfirm = () =>
      replaceObjects(
        targetServer,
        sourceServer,
        toCopy,
        existingObjects,
        targetWellbore,
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
  } else {
    const copyJob = createCopyJob(
      sourceServer,
      toCopy,
      targetWellbore,
      objectType
    );
    AuthorizationService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(
      JobType.CopyObjects,
      copyJob,
      targetServer,
      sourceServer
    );
  }
};

const createCopyJob = (
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

const createCopyWithParentJob = (
  sourceServer: Server,
  objects: ObjectOnWellbore[],
  targetWellbore: WellboreReference,
  objectType: ObjectType
): CopyWithParentJob => {
  const targetWellboreReference: WellboreReference = {
    wellUid: targetWellbore.wellUid,
    wellboreUid: targetWellbore.wellboreUid,
    wellName: targetWellbore.wellName,
    wellboreName: targetWellbore.wellboreName
  };
  const targetWellReference: WellReference = {
    wellUid: targetWellbore.wellUid,
    wellName: targetWellbore.wellName
  };
  const copyWellJob: CopyWellJob = {
    source: targetWellReference,
    target: targetWellReference
  };
  const copyWellboreJob: CopyWellboreJob = {
    source: targetWellboreReference,
    target: targetWellboreReference
  };
  const copyObjectsJob = createCopyJob(
    sourceServer,
    objects,
    targetWellbore,
    objectType
  );
  return {
    copyWellJob: copyWellJob,
    copyWellboreJob: copyWellboreJob,
    ...copyObjectsJob
  };
};

const replaceObjects = async (
  targetServer: Server,
  sourceServer: Server,
  toCopy: ObjectOnWellbore[],
  toDelete: ObjectOnWellbore[],
  targetWellbore: WellboreReference,
  objectType: ObjectType,
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteObjectsJob = {
    toDelete: toObjectReferences(toDelete, objectType)
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

function printObject(
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
