import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import LogComparisonModal, { LogComparisonModalProps } from "../Modals/LogComparisonModal";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export const onClickCompareLogToServer = async (targetServer: Server, sourceServer: Server, logToCompare: LogObject, dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const onCredentials = async () => {
    const props: LogComparisonModalProps = { sourceLog: logToCompare, sourceServer, targetServer, dispatchOperation };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <LogComparisonModal {...props} />
    });
  };
  const isAuthorized = CredentialsService.isAuthorizedForServer(targetServer);
  if (!isAuthorized) {
    const message = `You are trying to compare a log with a server that you are not logged in to. Please provide username and password for ${targetServer.name}.`;
    showCredentialsModal(targetServer, dispatchOperation, () => onCredentials(), message);
  } else {
    onCredentials();
  }
};
