import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import ComponentReferences, { createComponentReferences } from "../../models/jobs/componentReferences";
import { CopyComponentsJob } from "../../models/jobs/copyJobs";
import { DeleteComponentsJob } from "../../models/jobs/deleteJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { ReplaceLogDataJob } from "../../models/jobs/replaceLogDataJob";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import { displayMissingObjectModal } from "../Modals/MissingObjectModals";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation } from "./ContextMenuUtils";

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

  const targetLog = await LogObjectService.getLogFromServer(wellUid, wellboreUid, logUid, targetServer);
  if (targetLog.uid !== logUid) {
    displayMissingObjectModal(targetServer, wellUid, wellboreUid, logUid, dispatchOperation, "No curves will be copied.", ObjectType.Log);
    return;
  }

  const allCurves = await LogObjectService.getLogCurveInfoFromServer(wellUid, wellboreUid, targetLog.uid, sourceServer);
  const existingCurves: LogCurveInfo[] = allCurves.filter((curve) => curvesToCopy.find((curveToCopy) => curveToCopy.uid === curve.uid));
  if (existingCurves.length > 0) {
    const onConfirm = () => replaceCurves(targetServer, sourceServer, curvesToCopy, existingCurves, dispatchOperation, targetLog, sourceLog);
    displayReplaceModal(existingCurves, curvesToCopy, "curve", "log", dispatchOperation, onConfirm, printCurveInfo);
  } else {
    const copyJob = createCopyJob(sourceServer, curvesToCopy, targetLog, sourceLog);
    CredentialsService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(JobType.CopyLogData, copyJob, targetServer, sourceServer);
  }
};

const createCopyJob = (sourceServer: Server, curves: LogCurveInfoRow[], targetLog: LogObject, sourceLog: LogObject): CopyComponentsJob => {
  const sourceCurveReferences: ComponentReferences = createComponentReferences(
    curves.map((curve) => curve.mnemonic),
    sourceLog,
    ComponentType.Mnemonic,
    sourceServer.url
  );
  const targetLogReference: ObjectReference = toObjectReference(targetLog);
  const copyJob: CopyComponentsJob = { source: sourceCurveReferences, target: targetLogReference };
  return copyJob;
};

const replaceCurves = async (
  targetServer: Server,
  sourceServer: Server,
  curvesToCopy: LogCurveInfoRow[],
  curvesToDelete: LogCurveInfo[],
  dispatchOperation: DispatchOperation,
  targetLog: LogObject,
  sourceLog: LogObject
) => {
  dispatchOperation({ type: OperationType.HideModal });
  const deleteJob: DeleteComponentsJob = {
    toDelete: createComponentReferences(
      curvesToDelete.map((item) => item.mnemonic),
      targetLog,
      ComponentType.Mnemonic
    )
  };
  const copyJob: CopyComponentsJob = createCopyJob(sourceServer, curvesToCopy, targetLog, sourceLog);
  const replaceJob: ReplaceLogDataJob = { deleteJob, copyJob };
  await JobService.orderJobAtServer(JobType.ReplaceLogData, replaceJob, targetServer, sourceServer);
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
