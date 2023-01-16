import OperationType from "../../contexts/operationType";
import { CopyObjectsJob } from "../../models/jobs/copyJobs";
import { DeleteObjectsJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ReplaceLogObjectsJob } from "../../models/jobs/replaceLogObjectsJob";
import WellboreReference from "../../models/jobs/wellboreReference";
import LogObject from "../../models/logObject";
import { toObjectReferences } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import CredentialsService from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import WellboreService from "../../services/wellboreService";
import { displayMissingWellboreModal } from "../Modals/MissingObjectModals";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation } from "./ContextMenuUtils";

export const onClickCopyLogToServer = async (targetServer: Server, sourceServer: Server, logsToCopy: LogObject[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = logsToCopy[0].wellUid;
  const wellboreUid = logsToCopy[0].wellboreUid;

  const wellbore = await WellboreService.getWellboreFromServer(wellUid, wellboreUid, targetServer);
  if (wellbore.uid !== wellboreUid) {
    displayMissingWellboreModal(targetServer, wellUid, wellboreUid, dispatchOperation, "No logs will be copied.");
    return;
  }

  const logQueries = logsToCopy.map((log) => LogObjectService.getLogFromServer(wellUid, wellboreUid, log.uid, targetServer));
  const existingLogs: LogObject[] = [];
  for (const logQuery of logQueries) {
    const receivedLog = await logQuery;
    if (logsToCopy.find((log) => receivedLog.uid === log.uid)) {
      existingLogs.push(receivedLog);
    }
  }
  if (existingLogs.length > 0) {
    const onConfirm = () => replaceLogObjects(targetServer, sourceServer, logsToCopy, existingLogs, wellbore, dispatchOperation);
    displayReplaceModal(existingLogs, logsToCopy, "log", "wellbore", dispatchOperation, onConfirm, printLog);
  } else {
    const copyJob = createCopyJob(sourceServer, logsToCopy, wellbore);
    CredentialsService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(JobType.CopyLog, copyJob, targetServer, sourceServer);
  }
};

const createCopyJob = (sourceServer: Server, logs: LogObject[], targetWellbore: Wellbore): CopyObjectsJob => {
  const logReferences: ObjectReferences = toObjectReferences(logs, ObjectType.Log, sourceServer.url);
  const targetWellboreReference: WellboreReference = {
    wellUid: targetWellbore.wellUid,
    wellboreUid: targetWellbore.uid,
    wellName: targetWellbore.wellName,
    wellboreName: targetWellbore.name
  };
  const copyJob: CopyObjectsJob = { source: logReferences, target: targetWellboreReference };
  return copyJob;
};

const replaceLogObjects = async (
  targetServer: Server,
  sourceServer: Server,
  logsToCopy: LogObject[],
  logsToDelete: LogObject[],
  targetWellbore: Wellbore,
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
