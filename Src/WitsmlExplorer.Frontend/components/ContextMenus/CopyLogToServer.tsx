import OperationType from "../../contexts/operationType";
import CopyLogJob from "../../models/jobs/copyLogJob";
import { DeleteLogObjectsJob } from "../../models/jobs/deleteJobs";
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
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export const onClickCopyToServer = async (targetServer: Server, sourceServer: Server, logsToCopy: LogObject[], dispatchOperation: DispatchOperation) => {
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
      displayConfirmationModal(existingLogs, logsToCopy, sourceServer, targetCredentials, sourceCredentials, dispatchOperation);
    } else {
      const copyJob = createCopyJob(sourceServer, logsToCopy, wellUid, wellboreUid);
      CredentialsService.setSourceServer(sourceServer);
      JobService.orderJobAtServer(JobType.CopyLog, copyJob, [targetCredentials, sourceCredentials]);
    }
  };

  const hasPassword = CredentialsService.hasPasswordForServer(targetServer);
  if (!hasPassword) {
    const message = `You are trying to copy an object to a server that you are not logged in to. Please provide username and password for ${targetServer.name}.`;
    showCredentialsModal(targetServer, dispatchOperation, () => onCredentials(), message);
  } else {
    onCredentials();
  }
};

const createCopyJob = (sourceServer: Server, logs: LogObject[], wellUid: string, wellboreUid: string): CopyLogJob => {
  const logReferences: ObjectReferences = {
    serverUrl: sourceServer.url,
    wellUid: logs[0].wellUid,
    wellboreUid: logs[0].wellboreUid,
    objectUids: logs.map((log) => log.uid),
    objectType: ObjectType.Log
  };
  const targetWellboreReference: WellboreReference = {
    wellUid: wellUid,
    wellboreUid: wellboreUid
  };
  const copyJob: CopyLogJob = { source: logReferences, target: targetWellboreReference };
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
  const deleteJob: DeleteLogObjectsJob = {
    toDelete: {
      wellUid: logsToDelete[0].wellUid,
      wellboreUid: logsToDelete[0].wellboreUid,
      objectUids: logsToDelete.map((log) => log.uid),
      objectType: ObjectType.Log
    }
  };
  const copyJob: CopyLogJob = createCopyJob(sourceServer, logsToCopy, logsToCopy[0].wellUid, logsToCopy[0].wellboreUid);
  const replaceJob: ReplaceLogObjectsJob = { deleteJob, copyJob };
  await JobService.orderJobAtServer(JobType.ReplaceLogObjects, replaceJob, credentials);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

function displayConfirmationModal(
  existingLogs: LogObject[],
  logsToCopy: LogObject[],
  sourceServer: Server,
  targetCredentials: BasicServerCredentials,
  sourceCredentials: BasicServerCredentials,
  dispatchOperation: DispatchOperation
) {
  const contentIntro = logsToCopy.length > 1 ? `${existingLogs.length} out of the ${logsToCopy.length} logs to copy already` : "The log you are trying to copy already";
  const content =
    existingLogs.length > 1 ? (
      <span>
        {contentIntro} exist on the target wellbore. Do you want to delete and replace them?
        <br />
        Existing logs:
        {existingLogs.map((log) => printLog(log))}
      </span>
    ) : (
      <span>
        {contentIntro} exists on the target wellbore. Do you want to delete and replace it?
        <br />
        Existing log:
        {printLog(existingLogs[0])}
      </span>
    );
  const confirmation = (
    <ConfirmModal
      heading={`Replace log${existingLogs.length > 1 ? "s" : ""}?`}
      content={content}
      onConfirm={() => replaceLogObjects(sourceServer, [targetCredentials, sourceCredentials], logsToCopy, existingLogs, dispatchOperation)}
      confirmColor={"secondary"}
      confirmText={`Replace log${existingLogs.length > 1 ? "s" : ""}`}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
}

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
