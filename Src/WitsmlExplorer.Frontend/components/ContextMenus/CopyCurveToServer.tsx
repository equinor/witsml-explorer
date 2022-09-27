import OperationType from "../../contexts/operationType";
import { CopyLogDataJob, LogCurvesReference } from "../../models/jobs/copyLogDataJob";
import { DeleteMnemonicsJob } from "../../models/jobs/deleteJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { ReplaceLogDataJob } from "../../models/jobs/replaceLogDataJob";
import LogCurveInfo from "../../models/logCurveInfo";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import ConfirmModal from "../Modals/ConfirmModal";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export const onClickCopyCurveToServer = async (targetServer: Server, sourceServer: Server, curvesToCopy: LogCurveInfoRow[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = curvesToCopy[0].wellUid;
  const wellboreUid = curvesToCopy[0].wellboreUid;
  const logUid = curvesToCopy[0].logUid;

  const onCredentials = async () => {
    const targetCredentials = CredentialsService.getCredentialsForServer(targetServer);
    const sourceCredentials = CredentialsService.getCredentialsForServer(sourceServer);
    const log = await LogObjectService.getLogFromServer(wellUid, wellboreUid, logUid, targetCredentials);
    if (log.uid !== logUid) {
      displayFailureModal(targetServer, wellUid, wellboreUid, logUid, dispatchOperation);
      return;
    }

    const allCurves = await LogObjectService.getLogCurveInfoFromServer(wellUid, wellboreUid, log.uid, targetCredentials);
    const existingCurves: LogCurveInfo[] = allCurves.filter((curve) => curvesToCopy.find((curveToCopy) => curveToCopy.uid === curve.uid));
    if (existingCurves.length > 0) {
      const onConfirm = () => replaceCurves(sourceServer, [targetCredentials, sourceCredentials], curvesToCopy, existingCurves, dispatchOperation);
      displayReplaceModal(existingCurves, curvesToCopy, "curve", "log", dispatchOperation, onConfirm, printCurveInfo);
    } else {
      const copyJob = createCopyJob(sourceServer, curvesToCopy);
      CredentialsService.setSourceServer(sourceServer);
      JobService.orderJobAtServer(JobType.CopyLogData, copyJob, [targetCredentials, sourceCredentials]);
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

const createCopyJob = (sourceServer: Server, curves: LogCurveInfoRow[]): CopyLogDataJob => {
  const curveReferences: LogCurvesReference = {
    serverUrl: sourceServer.url,
    logReference: {
      wellUid: curves[0].wellUid,
      wellboreUid: curves[0].wellboreUid,
      uid: curves[0].logUid
    },
    mnemonics: curves.map((curve) => curve.mnemonic)
  };
  const targetLogReference: ObjectReference = {
    wellUid: curves[0].wellUid,
    wellboreUid: curves[0].wellboreUid,
    uid: curves[0].logUid
  };
  const copyJob: CopyLogDataJob = { source: curveReferences, target: targetLogReference };
  return copyJob;
};

const replaceCurves = async (
  sourceServer: Server,
  credentials: BasicServerCredentials[],
  curvesToCopy: LogCurveInfoRow[],
  curvesToDelete: LogCurveInfo[],
  dispatchOperation: DispatchOperation
) => {
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteMnemonicsJob = {
    toDelete: {
      logReference: {
        wellUid: curvesToCopy[0].wellUid,
        wellboreUid: curvesToCopy[0].wellboreUid,
        uid: curvesToCopy[0].logUid
      },
      mnemonics: curvesToDelete.map((item) => item.mnemonic)
    }
  };
  const copyJob: CopyLogDataJob = createCopyJob(sourceServer, curvesToCopy);
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
