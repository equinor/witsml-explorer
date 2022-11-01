import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import LogObjectService from "../../services/logObjectService";
import { displayLogComparisonModal } from "../Modals/LogComparisonModal";
import { displayMissingLogModal } from "../Modals/MissingObjectModals";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

const failureMessageSource = "Unable to compare the log as no log curve infos could be fetched from the source log.";
const failureMessageTarget = "Unable to compare the log as either the log does not exist on the target server or the target log is empty.";

export const onClickCompareLogToServer = async (targetServer: Server, sourceServer: Server, logToCompare: LogObject, dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = logToCompare.wellUid;
  const wellboreUid = logToCompare.wellboreUid;

  const onCredentials = async () => {
    const targetCredentials = CredentialsService.getCredentialsForServer(targetServer);
    const sourceLogCurveInfo = await LogObjectService.getLogCurveInfo(wellUid, wellboreUid, logToCompare.uid);
    if (sourceLogCurveInfo.length == 0) {
      displayMissingLogModal(sourceServer, wellUid, wellboreUid, logToCompare.uid, dispatchOperation, failureMessageSource);
      return;
    }
    const targetLogCurveInfo = await LogObjectService.getLogCurveInfoFromServer(wellUid, wellboreUid, logToCompare.uid, targetCredentials);
    if (targetLogCurveInfo.length == 0) {
      displayMissingLogModal(targetServer, wellUid, wellboreUid, logToCompare.uid, dispatchOperation, failureMessageTarget);
      return;
    }

    displayLogComparisonModal(logToCompare, sourceLogCurveInfo, targetLogCurveInfo, sourceServer, targetServer, dispatchOperation);
  };

  const isAuthorized = CredentialsService.isAuthorizedForServer(targetServer);
  if (!isAuthorized) {
    const message = `You are trying to compare a log with a server that you are not logged in to. Please provide username and password for ${targetServer.name}.`;
    showCredentialsModal(targetServer, dispatchOperation, () => onCredentials(), message);
  } else {
    onCredentials();
  }
};
