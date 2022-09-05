import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const onClickPaste = async (servers: Server[], serverUrl: string, dispatchOperation: DispatchOperation, orderCopyJob: () => void) => {
  const sourceServer = servers.find((server) => server.url === serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      showCredentialsModal(sourceServer, dispatchOperation, () => orderCopyJob());
    } else {
      orderCopyJob();
    }
  }
};

const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, orderCopyJob: () => void) => {
  const onConnectionVerified = async (credentials: ServerCredentials) => {
    await CredentialsService.saveCredentials(credentials);
    orderCopyJob();
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: `You are trying to paste an object from a server that you are not logged in to. Please provide username and password for ${server.name}.`,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};
