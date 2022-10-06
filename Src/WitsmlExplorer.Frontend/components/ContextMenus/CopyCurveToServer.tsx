import OperationType from "../../contexts/operationType";
import { CopyLogDataJob, LogCurvesReference } from "../../models/jobs/copyLogDataJob";
import { DeleteMnemonicsJob } from "../../models/jobs/deleteJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { ReplaceLogDataJob } from "../../models/jobs/replaceLogDataJob";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import ConfirmModal from "../Modals/ConfirmModal";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export interface OnClickCopyCurveToServerProps {
  targetServer: Server;
  sourceServer: Server;
  curvesToCopy: LogCurveInfoRow[];
  dispatchOperation: DispatchOperation;
  sourceLog: LogObject;
}

export const onClickCopyCurveToServer = async (props: OnClickCopyCurveToServerProps) => {
  const { targetServer, sourceServer, curvesToCopy, dispatchOperation, sourceLog } = props;
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = curvesToCopy[0].wellUid;
  const wellboreUid = curvesToCopy[0].wellboreUid;
  const logUid = curvesToCopy[0].logUid;

  const onCredentials = async () => {
    const targetCredentials = CredentialsService.getCredentialsForServer(targetServer);
    const sourceCredentials = CredentialsService.getCredentialsForServer(sourceServer);
    const targetLog = await LogObjectService.getLogFromServer(wellUid, wellboreUid, logUid, targetCredentials);
    if (targetLog.uid !== logUid) {
      displayFailureModal(targetServer, wellUid, wellboreUid, logUid, dispatchOperation);
      return;
    }

    const allCurves = await LogObjectService.getLogCurveInfoFromServer(wellUid, wellboreUid, targetLog.uid, targetCredentials);
    const existingCurves: LogCurveInfo[] = allCurves.filter((curve) => curvesToCopy.find((curveToCopy) => curveToCopy.uid === curve.uid));
    if (existingCurves.length > 0) {
      const onConfirm = () => replaceCurves(sourceServer, [targetCredentials, sourceCredentials], curvesToCopy, existingCurves, dispatchOperation, targetLog, sourceLog);
      displayReplaceModal(existingCurves, curvesToCopy, "curve", "log", dispatchOperation, onConfirm, printCurveInfo);
    } else {
      const copyJob = createCopyJob(sourceServer, curvesToCopy, targetLog, sourceLog);
      CredentialsService.setSourceServer(sourceServer);
      JobService.orderJobAtServer(JobType.CopyLogData, copyJob, [targetCredentials, sourceCredentials]);
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

const createCopyJob = (sourceServer: Server, curves: LogCurveInfoRow[], targetLog: LogObject, sourceLog: LogObject): CopyLogDataJob => {
  const curveReferences: LogCurvesReference = {
    serverUrl: sourceServer.url,
    logReference: toObjectReference(sourceLog),
    mnemonics: curves.map((curve) => curve.mnemonic)
  };
  const targetLogReference: ObjectReference = toObjectReference(targetLog);
  const copyJob: CopyLogDataJob = { source: curveReferences, target: targetLogReference };
  return copyJob;
};

const replaceCurves = async (
  sourceServer: Server,
  credentials: BasicServerCredentials[],
  curvesToCopy: LogCurveInfoRow[],
  curvesToDelete: LogCurveInfo[],
  dispatchOperation: DispatchOperation,
  targetLog: LogObject,
  sourceLog: LogObject
) => {
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteMnemonicsJob = {
    toDelete: {
      logReference: toObjectReference(targetLog),
      mnemonics: curvesToDelete.map((item) => item.mnemonic)
    }
  };
  const copyJob: CopyLogDataJob = createCopyJob(sourceServer, curvesToCopy, targetLog, sourceLog);
  const replaceJob: ReplaceLogDataJob = { deleteJob, copyJob };
  await JobService.orderJobAtServer(JobType.ReplaceLogData, replaceJob, credentials);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

function printCurveInfo(curve: LogCurveInfo): JSX.Element {
  const isDepthIndex = !!curve.maxDepthIndex;
  return (
    <>
      <br />
      Mnemonic: {curve.mnemonic}
      <br />
      Start index: {isDepthIndex ? curve.minDepthIndex : curve.minDateTimeIndex}
      <br />
      End index: {isDepthIndex ? curve.maxDepthIndex : curve.maxDateTimeIndex}
    </>
  );
}

function displayFailureModal(targetServer: Server, wellUid: string, wellboreUid: string, logUid: string, dispatchOperation: DispatchOperation) {
  const confirmation = (
    <ConfirmModal
      heading={`Log not found`}
      content={
        <span>
          Unable to find log on {targetServer.name}
          <br />
          with well UID {wellUid}
          <br />
          wellbore UID {wellboreUid}
          <br />
          and log UID {logUid}
          <br />
          No curves will be copied.
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
