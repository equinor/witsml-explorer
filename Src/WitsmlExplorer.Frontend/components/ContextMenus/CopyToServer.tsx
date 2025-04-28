import { displayCopyWellboreModal } from "components/Modals/CopyWellboreModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import {
  CopyWellboreJob,
  CopyWellJob,
  CopyWithParentJob
} from "models/jobs/copyJobs";
import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import AuthorizationService from "services/authorizationService";
import JobService, { JobType } from "services/jobService";
import ObjectService from "services/objectService";
import WellboreService from "services/wellboreService";
import { UidMappingDbQuery } from "../../models/uidMapping.tsx";
import UidMappingService from "../../services/uidMappingService.tsx";
import { createCopyJob, displayModalForReplace } from "./CopyUtils.tsx";

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

  const dbQuery: UidMappingDbQuery = {
    sourceServerId: sourceServer.id,
    sourceWellId: sourceWellUid,
    sourceWellboreId: sourceWellboreUid,
    targetServerId: targetServer.id
  };

  const mappings = await UidMappingService.queryUidMapping(dbQuery);

  let wellbore: Wellbore;
  try {
    if (mappings.length > 0) {
      wellbore = await WellboreService.getWellbore(
        mappings[0].targetWellId,
        mappings[0].targetWellboreId,
        null,
        targetServer
      );

      if (!wellbore) {
        await UidMappingService.removeUidMappings({
          wellUid: mappings[0].targetWellId,
          wellboreUid: mappings[0].targetWellboreId
        });
      }
    }

    if (!wellbore) {
      wellbore = await WellboreService.getWellbore(
        sourceWellUid,
        sourceWellboreUid,
        null,
        targetServer
      );
    }
  } catch {
    return; // Cancel the operation if unable to authorize to the target server.
  }

  let targetWellboreRef: WellboreReference;

  if (mappings.length > 0 && !!wellbore) {
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
    displayCopyWellboreModal(
      targetWellboreRef.wellboreUid,
      dispatchOperation,
      onConfirm
    );
    return;
  }

  confirmedCopyToServer(
    targetWellboreRef.wellUid,
    targetWellboreRef.wellboreUid,
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
    displayModalForReplace(
      sourceServer,
      targetServer,
      toCopy,
      existingObjects,
      targetWellbore,
      objectType,
      dispatchOperation
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
