import OperationType from "../../contexts/operationType";
import { CopyLogJob, CopyLogsWithParentJob, CopyObjectsJob, CopyWellboreJob, CopyWellJob } from "../../models/jobs/copyJobs";
import { DeleteObjectsJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ReplaceLogObjectsJob } from "../../models/jobs/replaceLogObjectsJob";
import WellboreReference from "../../models/jobs/wellboreReference";
import WellReference from "../../models/jobs/wellReference";
import LogObject from "../../models/logObject";
import { toObjectReferences } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import AuthorizationService from "../../services/authorizationService";
import JobService, { JobType } from "../../services/jobService";
import ObjectService from "../../services/objectService";
import WellboreService from "../../services/wellboreService";
import { displayCopyWellboreModal } from "../Modals/CopyWellboreModal";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation } from "./ContextMenuUtils";

export const onClickCopyLogToServer = async (targetServer: Server, sourceServer: Server, logsToCopy: LogObject[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = logsToCopy[0].wellUid;
  const wellboreUid = logsToCopy[0].wellboreUid;
  const wellName = logsToCopy[0].wellName;
  const wellboreName = logsToCopy[0].wellboreName;

  const wellboreRef = { wellUid: wellUid, wellboreUid: wellboreUid, wellName: wellName, wellboreName: wellboreName };

  const wellbore = await WellboreService.getWellboreFromServer(wellUid, wellboreUid, targetServer);
  if (wellbore.uid !== wellboreUid) {
    const onConfirm = () => {
      dispatchOperation({ type: OperationType.HideModal });
      confirmedCopyToServer(wellUid, wellboreUid, wellboreRef, true, targetServer, sourceServer, logsToCopy, dispatchOperation);
    }
    displayCopyWellboreModal(wellUid, wellboreUid, dispatchOperation, onConfirm);
    return;
  }

  confirmedCopyToServer(wellUid, wellboreUid, wellboreRef, false, targetServer, sourceServer, logsToCopy, dispatchOperation);
};

const confirmedCopyToServer = async (
  wellUid: string,
  wellboreUid: string,
  wellbore: WellboreReference,
  copyParents: boolean,
  targetServer: Server,
  sourceServer: Server,
  logsToCopy: LogObject[],
  dispatchOperation: DispatchOperation
) => {
  const logQueries = logsToCopy.map((log) => ObjectService.getObjectFromServer(wellUid, wellboreUid, log.uid, ObjectType.Log, targetServer));
  const existingLogs: LogObject[] = [];
  for (const logQuery of logQueries) {
    const receivedLog = await logQuery;
    if (logsToCopy.find((log) => receivedLog?.uid === log.uid)) {
      existingLogs.push(receivedLog);
    }
  }
  if (existingLogs.length > 0) {
    const onConfirm = () => replaceLogObjects(targetServer, sourceServer, logsToCopy, existingLogs, wellbore, dispatchOperation);
    displayReplaceModal(existingLogs, logsToCopy, "log", "wellbore", dispatchOperation, onConfirm, printLog);
  }
  else if (copyParents) {
    const copyWithParentJob = createCopyWithParentJob(sourceServer, logsToCopy, wellbore);
    AuthorizationService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(JobType.CopyLogWithParent, copyWithParentJob, targetServer, sourceServer);
  }
  else {
    const copyJob = createCopyJob(sourceServer, logsToCopy, wellbore);
    AuthorizationService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(JobType.CopyLog, copyJob, targetServer, sourceServer);
  }
};

const createCopyJob = (sourceServer: Server, logs: LogObject[], targetWellbore: WellboreReference): CopyLogJob => {
  const logReferences: ObjectReferences = toObjectReferences(logs, ObjectType.Log, sourceServer.url);
  const targetWellboreReference: WellboreReference = {
    wellUid: targetWellbore.wellUid,
    wellboreUid: targetWellbore.wellboreUid,
    wellName: targetWellbore.wellName,
    wellboreName: targetWellbore.wellboreName
  };
  const copyJob: CopyLogJob = { source: logReferences, target: targetWellboreReference };
  return copyJob;
};

const createCopyWithParentJob = (sourceServer: Server, logs: LogObject[], targetWellbore: WellboreReference): CopyLogsWithParentJob => {
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
  const copyWellJob: CopyWellJob = { source: targetWellReference, target: targetWellReference };
  const copyWellboreJob: CopyWellboreJob = { source: targetWellboreReference, target: targetWellboreReference };
  const copyLogJob: CopyLogJob = createCopyJob(sourceServer, logs, targetWellbore);
  return { copyWellJob: copyWellJob, copyWellboreJob: copyWellboreJob, copyLogJob: copyLogJob };
}

const replaceLogObjects = async (
  targetServer: Server,
  sourceServer: Server,
  logsToCopy: LogObject[],
  logsToDelete: LogObject[],
  targetWellbore: WellboreReference,
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteObjectsJob = {
    toDelete: toObjectReferences(logsToDelete, ObjectType.Log)
  };
  const copyJob: CopyObjectsJob = createCopyJob(sourceServer, logsToCopy, targetWellbore);
  const replaceJob: ReplaceLogObjectsJob = { deleteJob, copyJob };
  await JobService.orderJobAtServer(JobType.ReplaceLogObjects, replaceJob, targetServer, sourceServer);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

function printLog(log: LogObject): JSX.Element {
  return (
    <>
      <br />
      Name: {log.name}
      <br />
      Uid: {log.uid}
      <br />
      Start index: {log.startIndex}
      <br />
      End index: {log.endIndex}
    </>
  );
}
