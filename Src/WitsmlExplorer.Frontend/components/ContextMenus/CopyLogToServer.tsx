import OperationType from "../../contexts/operationType";
import CopyObjectsJob from "../../models/jobs/copyObjectsJob";
import { DeleteObjectsJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ReplaceLogObjectsJob } from "../../models/jobs/replaceLogObjectsJob";
import WellboreReference from "../../models/jobs/wellboreReference";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import WellboreService from "../../services/wellboreService";
import ConfirmModal from "../Modals/ConfirmModal";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export const onClickCopyLogToServer = async (targetServer: Server, sourceServer: Server, logsToCopy: LogObject[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = logsToCopy[0].wellUid;
  const wellboreUid = logsToCopy[0].wellboreUid;

  const onCredentials = async () => {
    const targetCredentials = CredentialsService.getCredentialsForServer(targetServer);
    const sourceCredentials = CredentialsService.getCredentialsForServer(sourceServer);
    const wellbore = await WellboreService.getWellboreFromServer(wellUid, wellboreUid, targetCredentials);
    if (wellbore.uid !== wellboreUid) {
      displayFailureModal(targetServer, wellUid, wellboreUid, dispatchOperation);
      return;
    }

    const logQueries = logsToCopy.map((log) => LogObjectService.getLogFromServer(wellUid, wellboreUid, log.uid, targetCredentials));
    const existingLogs: LogObject[] = [];
    for (const logQuery of logQueries) {
      const receivedLog = await logQuery;
      if (logsToCopy.find((log) => receivedLog.uid === log.uid)) {
        existingLogs.push(receivedLog);
      }
    }
    if (existingLogs.length > 0) {
      const onConfirm = () => replaceLogObjects(sourceServer, [targetCredentials, sourceCredentials], logsToCopy, existingLogs, dispatchOperation);
      displayReplaceModal(existingLogs, logsToCopy, "log", "wellbore", dispatchOperation, onConfirm, printLog);
    } else {
      const copyJob = createCopyJob(sourceServer, logsToCopy);
      CredentialsService.setSourceServer(sourceServer);
      JobService.orderJobAtServer(JobType.CopyLog, copyJob, [targetCredentials, sourceCredentials]);
    }
  };

  const isAuthorized = CredentialsService.isAuthorizedForServer(targetServer);
  if (!isAuthorized) {
    const message = `You are trying to copy an object to a server that you are not logged in to. Please provide username and password for ${targetServer.name}.`;
    showCredentialsModal(targetServer, dispatchOperation, () => onCredentials(), message);
  } else {
    onCredentials();
  }
};

const createCopyJob = (sourceServer: Server, logs: LogObject[]): CopyObjectsJob => {
  const logReferences: ObjectReferences = {
    serverUrl: sourceServer.url,
    wellUid: logs[0].wellUid,
    wellboreUid: logs[0].wellboreUid,
    objectUids: logs.map((log) => log.uid),
    objectType: ObjectType.Log
  };
  const targetWellboreReference: WellboreReference = {
    wellUid: logs[0].wellUid,
    wellboreUid: logs[0].wellboreUid
  };
  const copyJob: CopyObjectsJob = { source: logReferences, target: targetWellboreReference };
  return copyJob;
};

const replaceLogObjects = async (
  sourceServer: Server,
  credentials: BasicServerCredentials[],
  logsToCopy: LogObject[],
  logsToDelete: LogObject[],
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteObjectsJob = {
    toDelete: {
      wellUid: logsToDelete[0].wellUid,
      wellboreUid: logsToDelete[0].wellboreUid,
      objectUids: logsToDelete.map((log) => log.uid),
      objectType: ObjectType.Log
    }
  };
  const copyJob: CopyObjectsJob = createCopyJob(sourceServer, logsToCopy);
  const replaceJob: ReplaceLogObjectsJob = { deleteJob, copyJob };
  await JobService.orderJobAtServer(JobType.ReplaceLogObjects, replaceJob, credentials);
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

function displayFailureModal(targetServer: Server, wellUid: string, wellboreUid: string, dispatchOperation: DispatchOperation) {
  const confirmation = (
    <ConfirmModal
      heading={`Wellbore not found`}
      content={
        <span>
          Unable to find wellbore on {targetServer.name}
          <br />
          with well UID {wellUid}
          <br />
          and wellbore UID {wellboreUid}
          <br />
          No logs will be copied.
        </span>
      }
      onConfirm={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
}
